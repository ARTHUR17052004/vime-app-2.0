const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');
const { validarCpf } = require('../utils/cpf');
const { validarTelefone } = require('../utils/validadores');
const { filtroInquilino } = require('../utils/escopoLocador');
const contratoService = require('./contratoService');
const campoObrigatorioService = require('./campoObrigatorioService');
const auditoriaService = require('./auditoriaService');
const logService = require('./logService');
const { kitnetAindaOcupada, gerarVistoriaDeEntrega } = require('../utils/kitnetOcupacao');

const sanitizar = (dados) => {

  if (dados.cpf) {
    if (!validarCpf(dados.cpf)) {
      throw new Error('CPF inválido.');
    }
  }

  if (dados.telefone && !validarTelefone(dados.telefone)) {
    throw new Error('Telefone inválido.');
  }

  if (dados.telefoneEmergencia && !validarTelefone(dados.telefoneEmergencia)) {
    throw new Error('Telefone de Emergência inválido.');
  }

  if (dados.dataNascimento !== undefined) dados.dataNascimento = paraDataOuNull(dados.dataNascimento);
  if (dados.dataFimContrato !== undefined) dados.dataFimContrato = paraDataOuNull(dados.dataFimContrato);

  if (dados.dataInicioContrato !== undefined) {
    if (!dados.dataInicioContrato) {
      throw new Error('Data de início do contrato é obrigatória.');
    }
    dados.dataInicioContrato = new Date(dados.dataInicioContrato);
  }

  if (dados.prazoContrato !== undefined && dados.prazoContrato !== "") {
    dados.prazoContrato = Number(dados.prazoContrato);
  } else {
    dados.prazoContrato = null;
  }

  if (dados.valorCaucao !== undefined && dados.valorCaucao !== "") {
    dados.valorCaucao = Number(dados.valorCaucao);
  } else {
    dados.valorCaucao = null;
  }

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.kitnetNome;
  delete dados.unidadeNome;
  delete dados.kitnet;
  delete dados.contratos;

  return dados;

};

const listar = (usuario) => {
  return prisma.inquilino.findMany({
    where: filtroInquilino(usuario),
    include: {
      kitnet: {
        include: {
          unidade: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = async (id, usuario) => {

  const inquilino = await prisma.inquilino.findUnique({
    where: { id },
    include: {
      kitnet: {
        include: {
          unidade: true
        }
      }
    }
  });

  if (usuario?.locadorId && inquilino && inquilino.kitnet?.unidade?.locadorId !== usuario.locadorId) {
    return null;
  }

  return inquilino;

};

// Trava a kitnet pra um inquilino ativo por vez -- sem isso dava pra
// cadastrar/mudar um inquilino pra uma kitnet que já tinha outro morando,
// e o sistema achava que estava tudo normal (foi o que aconteceu na ARA:
// duas pessoas acabaram em "kitnet 15" por falta dessa trava).
const validarKitnetLivre = async (kitnetId, { ignorarInquilinoId } = {}) => {

  const outro = await prisma.inquilino.findFirst({
    where: {
      kitnetId,
      ativo: true,
      ...(ignorarInquilinoId ? { id: { not: ignorarInquilinoId } } : {}),
    },
  });

  if (outro) {
    throw new Error(
      `Essa kitnet já está ocupada por ${outro.nome}. Não é possível cadastrar dois inquilinos na mesma kitnet -- encerre/transfira o inquilino atual antes de colocar outro.`
    );
  }

};

// Mesma pessoa (mesmo CPF) cadastrada duas vezes como inquilino ativo --
// escopado por locador, porque dois locadores diferentes nesse sistema
// podem legitimamente ter cada um o seu próprio inquilino com o mesmo
// CPF (não é duplicidade, são clientes diferentes).
const validarCpfUnico = async (cpf, kitnetId, { ignorarInquilinoId } = {}) => {

  if (!cpf) return;

  const kitnet = await prisma.kitnet.findUnique({
    where: { id: kitnetId },
    include: { unidade: true },
  });

  const locadorId = kitnet?.unidade?.locadorId ?? null;

  const duplicado = await prisma.inquilino.findFirst({
    where: {
      cpf,
      ativo: true,
      ...(ignorarInquilinoId ? { id: { not: ignorarInquilinoId } } : {}),
      kitnet: { unidade: { locadorId } },
    },
  });

  if (duplicado) {
    throw new Error(
      `Já existe um inquilino ativo cadastrado com esse CPF: ${duplicado.nome}. Não é possível cadastrar o mesmo cliente duas vezes.`
    );
  }

};

const criar = async (dados) => {

  const gerarContratoAutomatico = dados.gerarContratoAutomatico === true;
  delete dados.gerarContratoAutomatico;

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('inquilino', dados);

  if (dados.ativo !== false) {
    await validarKitnetLivre(dados.kitnetId);
    await validarCpfUnico(dados.cpf, dados.kitnetId);
  }

  const inquilino = await prisma.inquilino.create({
    data: dados
  });

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  let avisoContrato = null;
  let contratoId = null;

  if (gerarContratoAutomatico) {

    try {

      const kitnet = await prisma.kitnet.findUnique({
        where: { id: inquilino.kitnetId }
      });

      const unidade = kitnet
        ? await prisma.unidade.findUnique({ where: { id: kitnet.unidadeId } })
        : null;

      if (!unidade || !unidade.locadorId) {

        avisoContrato =
          'Inquilino cadastrado, mas o contrato automático não foi gerado: a unidade não tem um locador vinculado.';

      } else {

        const dataInicio = new Date(inquilino.dataInicioContrato);

        const contrato = await contratoService.criar({
          locadorId: unidade.locadorId,
          unidadeId: unidade.id,
          kitnetId: kitnet.id,
          inquilinoId: inquilino.id,
          dataInicio: inquilino.dataInicioContrato,
          dataFim: inquilino.dataFimContrato || undefined,
          valorAluguel: kitnet.aluguel,
          diaVencimento: unidade.vencimento || dataInicio.getDate(),
          indiceReajuste: inquilino.indiceReajuste || null,
          tipoGarantia: inquilino.tipoGarantia || null,
          valorCaucao: inquilino.valorCaucao || null,
          // Índice de Reajuste, Tipo de Garantia e Valor da Caução não
          // têm mais campo na etapa 3 do cadastro de inquilino -- não
          // trava a criação automática do contrato por causa deles,
          // mesmo que "Contratos" os exija.
          ignorarObrigatorios: ['indiceReajuste', 'tipoGarantia', 'valorCaucao'],
        });

        contratoId = contrato.id;

        // NÃO gera cobrança aqui -- regra já estabelecida em
        // contratoService.criar/clicksignService.processarWebhook: a
        // cobrança do aluguel só nasce depois que o contrato for
        // assinado de verdade na Clicksign (evento "close"/"auto_close").
        // Contrato recém-criado começa como "PENDENTE", não assinado.

      }

    } catch (erroContrato) {

      console.error(
        'Erro ao gerar contrato automático para novo inquilino:',
        erroContrato.message
      );

      avisoContrato =
        erroContrato.message ||
        'Inquilino cadastrado, mas não foi possível gerar o contrato automático.';

    }

  }

  return { ...inquilino, avisoContrato, contratoId };
};

const atualizar = async (id, dados) => {

  // Default true pra não quebrar chamada antiga que não manda esse
  // campo -- só vira "não" quando o popup "Enviar vistoria de
  // entrega?" (ver InquilinoForm/página de edição) for respondido assim.
  const gerarVistoriaEntrega = dados.gerarVistoriaEntrega !== false;
  delete dados.gerarVistoriaEntrega;

  const anterior = await prisma.inquilino.findUnique({
    where: { id }
  });

  dados = sanitizar(dados);

  // Atualização parcial não pode reprovar por "faltar" um campo que já
  // está preenchido desde a criação -- valida o resultado final
  // (anterior + alterações), não só o pedaço enviado nesta chamada.
  await campoObrigatorioService.validar('inquilino', { ...anterior, ...dados });

  const mudandoKitnet = Boolean(
    anterior &&
    dados.kitnetId &&
    dados.kitnetId !== anterior.kitnetId
  );

  // Valida ANTES de efetivar a troca -- checar depois do update já é
  // tarde demais, o inquilino já teria sido movido pra kitnet ocupada.
  const ficandoAtivo = dados.ativo !== false && (anterior?.ativo !== false || dados.ativo === true);
  if (mudandoKitnet && ficandoAtivo) {
    await validarKitnetLivre(dados.kitnetId, { ignorarInquilinoId: id });
  }

  // Mesmo CPF duas vezes só interessa checar quando ele muda nesta
  // chamada, ou quando o inquilino está sendo reativado (ex.: "Inativo"
  // -> "Ativo" de novo) -- editar qualquer outro campo de um cadastro que
  // já tinha esse CPF antes não deve travar o salvar.
  const cpfMudou = dados.cpf !== undefined && dados.cpf !== anterior?.cpf;
  const reativando = dados.ativo === true && anterior?.ativo === false;
  if (ficandoAtivo && (cpfMudou || reativando)) {
    await validarCpfUnico(
      dados.cpf !== undefined ? dados.cpf : anterior?.cpf,
      dados.kitnetId || anterior?.kitnetId,
      { ignorarInquilinoId: id }
    );
  }

  const inquilino = await prisma.inquilino.update({
    where: { id },
    data: dados
  });

  if (mudandoKitnet) {

    // Só esvazia a kitnet antiga se não sobrou outro inquilino/contrato
    // ativo nela (pode ser uma república, com mais de um morador).
    if (!(await kitnetAindaOcupada(anterior.kitnetId, { ignorarInquilinoId: id }))) {
      await prisma.kitnet.update({
        where: {
          id: anterior.kitnetId
        },
        data: {
          ocupada: false,
          status: 'DISPONIVEL'
        }
      });
      if (gerarVistoriaEntrega) {
        gerarVistoriaDeEntrega(anterior.kitnetId);
      }
    }

    await prisma.kitnet.update({
      where: {
        id: dados.kitnetId
      },
      data: {
        ocupada: true,
        status: 'OCUPADA'
      }
    });

  }

  return inquilino;
};

const remover = async (id, autor, opcoes = {}) => {

  const gerarVistoriaEntrega = opcoes.gerarVistoriaEntrega !== false;

  const inquilino = await prisma.inquilino.findUnique({
    where: { id },
    include: { receitas: true }
  });

  if (!inquilino) {
    throw new Error('Inquilino não encontrado.');
  }

  // PROIBIDO: excluir o inquilino some com o vínculo da receita (ela
  // não é apagada, só fica sem inquilino nem contrato -- ver schema),
  // e aí nenhuma trava de cobrança duplicada enxerga mais ela. Foi
  // exatamente isso que gerou dois boletos reais pro mesmo aluguel em
  // 10/11/2026 (Luís Eduardo): o inquilino foi excluído com uma
  // cobrança já em aberto, ela ficou órfã, e uma segunda cobrança do
  // mesmo mês foi criada sem ninguém saber que já existia uma.
  // Mesma trava que contratoService.remover() já tem pra contrato --
  // aqui pro inquilino.
  if (inquilino.receitas.length > 0) {
    const erro = new Error(
      `PROIBIDO: esse inquilino tem ${inquilino.receitas.length} cobrança(s) vinculada(s) -- não é possível excluir. Resolva (cancele, pague ou reatribua) cada cobrança antes de excluir o inquilino.`
    );
    erro.status = 400;
    throw erro;
  }

  if (!(await kitnetAindaOcupada(inquilino.kitnetId, { ignorarInquilinoId: id }))) {
    await prisma.kitnet.update({
      where: {
        id: inquilino.kitnetId
      },
      data: {
        ocupada: false,
        status: 'DISPONIVEL'
      }
    });
    if (gerarVistoriaEntrega) {
      gerarVistoriaDeEntrega(inquilino.kitnetId);
    }
  }

  const removido = await prisma.inquilino.delete({
    where: { id }
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "INQUILINOS",
    registroId: id,
    acao: "EXCLUIR",
    valorAnterior: inquilino,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "INQUILINOS",
    acao: "EXCLUIR",
    descricao: `Inquilino "${inquilino.nome}" excluído por ${autor?.nome || "Sistema"}.`
  });

  return removido;
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
