const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');

const ClicksignApi = require("./ClicksignApi");
const logService = require("./logService");
const auditoriaService = require("./auditoriaService");
const WhatsappService = require("./whatsappService");
const notificacaoService = require("./notificacaoService");
const contratoDocumentoService = require("./contratoDocumentoService");
const campoObrigatorioService = require("./campoObrigatorioService");

// Nome de arquivo legível pro documento no Clicksign -- antes ficava
// "contrato-<uuid>.pdf", sem nenhuma relação visível com o inquilino.
const slugificarNomeArquivo = (nome) => {
  return (nome || 'inquilino')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
};

// A tela de edição pré-preenche o formulário espalhando o contrato
// inteiro (que vem com locador/unidade/kitnet/inquilino/receitas
// aninhados), e reenvia tudo isso no salvar -- sem isso o
// prisma.contrato.update() quebra com "Unknown argument" pros campos
// de relação.
const sanitizar = (dados) => {

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.locador;
  delete dados.unidade;
  delete dados.kitnet;
  delete dados.inquilino;
  delete dados.receitas;

  return dados;

};

const listar = () => {
  return prisma.contrato.findMany({
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true,
      receitas: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.contrato.findUnique({
    where: { id },
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true,
      receitas: true
    }
  });
};

const criar = async (dados) => {

  await campoObrigatorioService.validar('contrato', dados);

  if (!dados.dataInicio) {
    throw new Error('Data de início do contrato é obrigatória.');
  }
  dados.dataInicio = new Date(dados.dataInicio);
  dados.dataFim = dados.dataFim !== undefined ? paraDataOuNull(dados.dataFim) : null;

  // Sem data final informada, o contrato vale por 4 meses a partir do
  // início -- valor padrão, ainda editável em Contratos depois.
  if (!dados.dataFim) {
    const fimPadrao = new Date(dados.dataInicio);
    fimPadrao.setMonth(fimPadrao.getMonth() + 4);
    dados.dataFim = fimPadrao;
  }

  const kitnet = await prisma.kitnet.findUnique({
    where: {
      id: dados.kitnetId
    }
  });

  const unidade = await prisma.unidade.findUnique({
    where: {
      id: dados.unidadeId
    }
  });

  const locador = await prisma.locador.findUnique({
    where: {
      id: dados.locadorId
    }
  });

  const inquilino = await prisma.inquilino.findUnique({
    where: {
      id: dados.inquilinoId
    }
  });

  if (!kitnet) {
    throw new Error('Kitnet não encontrada.');
  }

  if (!unidade) {
    throw new Error('Unidade não encontrada.');
  }

  if (!locador) {
    throw new Error('Locador não encontrado.');
  }

  if (!inquilino) {
    throw new Error('Inquilino não encontrado.');
  }

  // "PENDENTE" entra na checagem junto de "ATIVO": um contrato recém-criado
  // fica pendente até a assinatura na Clicksign, mas já ocupa a kitnet/o
  // inquilino nesse meio-tempo — sem isso dava pra criar dois contratos
  // pro mesmo inquilino/kitnet enquanto o primeiro ainda esperava assinatura.
  const statusEmVigor = { in: ["ATIVO", "PENDENTE"] };

  const contratoAtivo = await prisma.contrato.findFirst({
    where: {
      inquilinoId: dados.inquilinoId,
      status: statusEmVigor
    }
  });

  const contratoKitnet = await prisma.contrato.findFirst({
    where: {
      kitnetId: dados.kitnetId,
      status: statusEmVigor
    }
  });

  if (contratoKitnet) {
    throw new Error(
      "Esta kitnet já possui um contrato ativo."
    );
  }

  const contratoUnidade = await prisma.contrato.findFirst({
    where: {
      unidadeId: dados.unidadeId,
      kitnetId: dados.kitnetId,
      status: statusEmVigor
    }
  });

  if (
    contratoUnidade &&
    contratoUnidade.id !== contratoKitnet?.id
  ) {
    throw new Error(
      "Já existe um contrato ativo para esta unidade/kitnet."
    );
  }

  if (contratoAtivo) {
    throw new Error(
      "Este inquilino já possui um contrato ativo."
    );
  }

  if (kitnet.unidadeId !== unidade.id) {
    throw new Error(
      'A kitnet informada não pertence à unidade selecionada.'
    );
  }

  if (unidade.locadorId !== locador.id) {
    throw new Error(
      'A unidade informada não pertence ao locador selecionado.'
    );
  }

  if (inquilino.kitnetId !== kitnet.id) {
    throw new Error(
      'O inquilino informado não pertence à kitnet selecionada.'
    );
  }

  // Não checamos kitnet.ocupada aqui: esse flag é marcado assim que um
  // inquilino é vinculado (inquilinoService.criar), antes de chegar
  // neste ponto — checar aqui sempre barraria a criação. A checagem
  // real de contrato duplicado já é feita acima via `contratoKitnet`.

  if (dados.valorAluguel <= 0) {
    throw new Error(
      'Valor do aluguel inválido.'
    );
  }

  if (
    dados.diaVencimento < 1 ||
    dados.diaVencimento > 31
  ) {
    throw new Error(
      'Dia de vencimento inválido.'
    );
  }

  if (
    dados.dataFim &&
    new Date(dados.dataFim) <= new Date(dados.dataInicio)
  ) {
    throw new Error(
      'A data final deve ser maior que a data inicial.'
    );
  }

  const contrato = await prisma.contrato.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: contrato
  });

  try {

    const conteudoBase64 = await contratoDocumentoService.gerarContratoPdfBase64({
      ...contrato,
      locador,
      unidade,
      kitnet,
      inquilino
    });

    const documentoCriado = await ClicksignApi.criarDocumento({
      document: {
        path: `/contrato-${slugificarNomeArquivo(inquilino.nome)}.pdf`,
        content_base64: conteudoBase64,
        auto_close: true
      }
    });

    const documentKey =
      documentoCriado?.document?.key ||
      documentoCriado?.key ||
      null;

    if (documentKey) {

      await prisma.contrato.update({
        where: { id: contrato.id },
        data: { clicksignDocumentKey: documentKey }
      });

      const signatarioCriado = await ClicksignApi.criarSignatario({
        email: inquilino.email,
        phone_number: inquilino.telefone,
        auth_mode: "email",
        name: inquilino.nome
      });

      const signerKey =
        signatarioCriado?.signer?.key ||
        signatarioCriado?.key ||
        null;

      if (signerKey) {

        const listaCriada = await ClicksignApi.criarLista(documentKey, signerKey, {
          message: `Olá ${inquilino.nome}, segue seu contrato de locação para assinatura.`
        });

        const signingUrl = listaCriada?.list?.url || null;

        if (signingUrl) {
          await prisma.contrato.update({
            where: { id: contrato.id },
            data: { clicksignSigningUrl: signingUrl }
          });
        }

      }

    }

    // Cobrança NÃO é gerada aqui de propósito: só depois que o
    // inquilino assinar o contrato de verdade (ver
    // clicksignService.processarWebhook, evento "signature_finished").
    // Asaas/Financeiro não devem cobrar por um contrato que ainda nem
    // foi aceito.

    await WhatsappService.enviarMensagem({
      numero: inquilino.telefone,
      mensagem: `Olá ${inquilino.nome}, seu contrato foi criado com sucesso e enviado para assinatura.`
    });

  } catch (integracaoError) {

    console.error(
      "Erro em integração externa ao criar contrato (Clicksign/Asaas/WhatsApp):",
      integracaoError.message
    );

  }

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CLICKSIGN",
    acao: "CRIAR_DOCUMENTO",
    descricao: `Documento do contrato ${contrato.id} enviado.`
  });

  // A receita/cobrança do aluguel é criada só depois que o contrato
  // for assinado de verdade (ver processarWebhook -> "signature_finished").

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  await prisma.inquilino.update({
    where: {
      id: dados.inquilinoId
    },
    data: {
      ativo: true
    }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "CRIAR",
    descricao: `Contrato ${contrato.id} criado.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Novo contrato criado",
    mensagem: `Contrato de ${inquilino.nome} na kitnet ${kitnet.numero} foi criado.`,
    link: `/contratos/${contrato.id}`
  });

  return contrato;

};

const atualizar = async (id, dados) => {

  dados = sanitizar(dados);

  if (dados.dataInicio !== undefined) {
    if (!dados.dataInicio) {
      throw new Error('Data de início do contrato é obrigatória.');
    }
    dados.dataInicio = new Date(dados.dataInicio);
  }
  if (dados.dataFim !== undefined) dados.dataFim = paraDataOuNull(dados.dataFim);

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  if (dados.inquilinoId && dados.inquilinoId !== anterior?.inquilinoId) {

    const contratoAtivo = await prisma.contrato.findFirst({
      where: {
        inquilinoId: dados.inquilinoId,
        status: { in: ["ATIVO", "PENDENTE"] },
        id: { not: id },
      }
    });

    if (contratoAtivo) {
      throw new Error("Este inquilino já possui um contrato ativo.");
    }

  }

  const contrato = await prisma.contrato.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: contrato
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ATUALIZAR",
    descricao: `Contrato ${contrato.id} atualizado.`
  });

  return contrato;

};

const remover = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      receitas: true
    }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  if (contrato.receitas.length > 0) {
    throw new Error(
      'Não é possível excluir um contrato que possui receitas vinculadas.'
    );
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "EXCLUIR",
    valorAnterior: contrato,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "EXCLUIR",
    descricao: `Contrato ${contrato.id} excluído.`
  });

  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: "DISPONIVEL"
    }
  });

  await prisma.inquilino.update({
    where: {
      id: contrato.inquilinoId
    },
    data: {
      ativo: false
    }
  });

  return prisma.contrato.delete({
    where: { id }
  });

};

const encerrar = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  const contratoEncerrado = await prisma.contrato.update({
    where: { id },
    data: {
      status: 'ENCERRADO',
      dataFim: contrato.dataFim || new Date()
    }
  });

  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: 'DISPONIVEL'
    }
  });

  await prisma.inquilino.update({
    where: {
      id: contrato.inquilinoId
    },
    data: {
      ativo: false
    }
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "ENCERRAR",
    valorAnterior: contrato,
    valorNovo: contratoEncerrado
  });

  await prisma.receita.updateMany({
    where: {
      contratoId: contrato.id,
      status: "PENDENTE",
      vencimento: {
        gt: new Date()
      }
    },
    data: {
      status: "CANCELADA"
    }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ENCERRAR",
    descricao: `Contrato ${contrato.id} encerrado.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Contrato encerrado",
    mensagem: `Contrato ${contrato.id} foi encerrado.`,
    link: `/contratos/${contrato.id}`
  });

  try {
    await WhatsappService.enviarMensagem({
      numero: contrato.inquilino?.telefone,
      mensagem: "Seu contrato foi encerrado."
    });
  } catch (whatsappError) {
    console.error("Erro ao enviar WhatsApp de encerramento:", whatsappError.message);
  }

  return contratoEncerrado;

};

const renovar = async (id, dados) => {

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  const contrato = await prisma.contrato.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "RENOVAR",
    valorAnterior: anterior,
    valorNovo: contrato
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "RENOVAR",
    descricao: `Contrato ${contrato.id} renovado.`
  });

  return contrato;

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  encerrar,
  renovar
};