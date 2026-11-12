const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');
const { filtroReceita } = require('../utils/escopoLocador');
const { emitirAtualizacao } = require('../socket');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const campoObrigatorioService = require('./campoObrigatorioService');
const contaPagamentoService = require('./contaPagamentoService');
const notificacaoService = require('./notificacaoService');
const corteVistoriaService = require('./corteVistoriaService');
const { doContrato, doInquilino, daReceita: locadorIdDaReceita } = require('../utils/locadorDeRegistro');
const { diffCampos } = require('../utils/diffCampos');

const CAMPOS_RECEITA = {
  descricao: 'descrição',
  categoria: 'categoria',
  valor: { rotulo: 'valor', tipo: 'moeda' },
  vencimento: { rotulo: 'vencimento', tipo: 'data' },
  dataPagamento: { rotulo: 'data de pagamento', tipo: 'data' },
  status: 'status',
  pagadorNome: 'pagador',
};

const locadorDaReceita = async (dados) => {
  if (dados.contratoId) {
    const l = await doContrato(dados.contratoId);
    if (l) return l;
  }
  if (dados.inquilinoId) return doInquilino(dados.inquilinoId);
  return null;
};

// Multa/juros por atraso configurados no cadastro do Locador (campo
// "Multa"/"Juros" dele, em %) -- usados como padrão de toda cobrança
// nova desse locador, a menos que a receita já tenha um valor próprio
// definido (ex.: negociação pontual via Asaas Transações -> Editar).
// Sem isso, NENHUMA cobrança saía com multa/juros por atraso, mesmo
// quando o locador tinha esses percentuais configurados -- bug
// relatado em 10/11/2026 ("as cobranças estão vindo sem juros e multa
// por atraso").
const multaJurosPadrao = async (locadorId) => {

  if (!locadorId) return { multaValor: null, jurosValor: null };

  const locador = await prisma.locador.findUnique({
    where: { id: locadorId },
    select: { multa: true, juros: true },
  });

  return {
    multaValor: locador?.multa || null,
    jurosValor: locador?.juros || null,
  };

};

// Trava duplicata de Aluguel: mesmo inquilino (ou mesmo pagador avulso,
// pelo CPF) com cobrança vencendo no MESMO mês não pode ganhar uma
// segunda -- ÚNICA função de verdade pra essa checagem, usada aqui na
// criação manual (Nova Receita/Nova Cobrança) E pelos dois motores
// automáticos (cobrancaRecorrenteService, gerarRecorrenciaReceitasJob).
// Antes cada um tinha sua própria checagem solta, cada uma enxergando
// só o SEU jeito de vínculo (Contrato ou Inquilino direto) -- foi
// exatamente isso que causou 29 "Aluguel" duplicados em 11/2026,
// porque o motor de Contrato não via a cobrança já criada por
// Inquilino (e vice-versa). Agora resolve sempre o inquilino de
// verdade (direto ou via contrato.inquilinoId) e cruza os dois lados.
// Cancelada nunca conta -- não é cobrança "em aberto" nenhuma (sem
// isso, uma duplicata cancelada travava pra sempre a geração do mês
// seguinte, mesmo a cobrança de verdade já estando paga). Só olha a
// categoria "Aluguel" -- Multa/Taxa/Outros podem ter mais de um
// lançamento legítimo no mesmo mês. `ignorarId`: pra reusar isto numa
// edição, sem a própria receita contar contra si mesma.
const existeAluguelDuplicado = async (dados, { ignorarId } = {}) => {

  if (dados.categoria !== 'Aluguel' || !dados.vencimento) return false;

  const vencimento = new Date(dados.vencimento);
  const inicioMes = new Date(vencimento.getFullYear(), vencimento.getMonth(), 1);
  const inicioProximoMes = new Date(vencimento.getFullYear(), vencimento.getMonth() + 1, 1);

  // Cobrança avulsa (sem inquilino nem contrato) -- só cruza por CPF
  // do pagador, como já era.
  if (!dados.inquilinoId && !dados.contratoId) {

    if (!dados.pagadorCpf) return false;

    const existente = await prisma.receita.findFirst({
      where: {
        categoria: 'Aluguel',
        status: { not: 'CANCELADA' },
        vencimento: { gte: inicioMes, lt: inicioProximoMes },
        pagadorCpf: dados.pagadorCpf,
        ...(ignorarId ? { id: { not: ignorarId } } : {}),
      },
    });

    return Boolean(existente);

  }

  let inquilinoReal = dados.inquilinoId || null;

  if (!inquilinoReal && dados.contratoId) {
    const contrato = await prisma.contrato.findUnique({
      where: { id: dados.contratoId },
      select: { inquilinoId: true },
    });
    inquilinoReal = contrato?.inquilinoId || null;
  }

  if (!inquilinoReal) return false;

  const contratosDoInquilino = await prisma.contrato.findMany({
    where: { inquilinoId: inquilinoReal },
    select: { id: true },
  });

  const existente = await prisma.receita.findFirst({
    where: {
      categoria: 'Aluguel',
      status: { not: 'CANCELADA' },
      vencimento: { gte: inicioMes, lt: inicioProximoMes },
      ...(ignorarId ? { id: { not: ignorarId } } : {}),
      OR: [
        { inquilinoId: inquilinoReal },
        ...(contratosDoInquilino.length > 0
          ? [{ contratoId: { in: contratosDoInquilino.map((c) => c.id) } }]
          : []),
      ],
    },
  });

  return Boolean(existente);

};

// Mesma ideia de locadorDaReceita, mas pra descobrir a KITNET -- um
// locador pode ter várias contas (ex.: SH com BB-H, BB-S e Efí, cada
// uma recebendo de kitnets diferentes), então quem decide a conta de
// verdade é a kitnet da receita (ver ContaPagamentoService.resolverParaKitnet),
// não só o locador dela.
const kitnetDaReceita = async (dados) => {
  if (dados.contratoId) {
    const contrato = await prisma.contrato.findUnique({
      where: { id: dados.contratoId },
      select: { kitnetId: true },
    });
    if (contrato?.kitnetId) return contrato.kitnetId;
  }
  if (dados.inquilinoId) {
    const inquilino = await prisma.inquilino.findUnique({
      where: { id: dados.inquilinoId },
      select: { kitnetId: true },
    });
    if (inquilino?.kitnetId) return inquilino.kitnetId;
  }
  return null;
};

// "Nova Receita" e "Nova Cobrança" criam a mesma Receita por baixo,
// mas são telas diferentes -- cada uma com sua própria configuração em
// Campos Obrigatórios ("receita" vs "cobranca"). `origemFormulario` diz
// qual delas validar; não é campo do model, sai do payload antes do
// create/update.
const extrairModulo = (dados) => {
  const modulo = dados.origemFormulario === 'cobranca' ? 'cobranca' : 'receita';
  delete dados.origemFormulario;
  return modulo;
};

const sanitizar = (dados) => {

  if (dados.vencimento !== undefined) dados.vencimento = paraDataOuNull(dados.vencimento);
  if (dados.dataPagamento !== undefined) dados.dataPagamento = paraDataOuNull(dados.dataPagamento);

  if (dados.valor !== undefined) {
    const valor = Number(String(dados.valor).replace(',', '.'));
    if (Number.isNaN(valor)) {
      throw new Error('Valor inválido.');
    }
    dados.valor = valor;
  }

  const paraNumeroOuNull = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
  };

  if (dados.descontoValor !== undefined) dados.descontoValor = paraNumeroOuNull(dados.descontoValor);
  if (dados.descontoDias !== undefined) dados.descontoDias = dados.descontoDias === '' || dados.descontoDias === null ? null : parseInt(dados.descontoDias, 10);
  if (dados.multaValor !== undefined) dados.multaValor = paraNumeroOuNull(dados.multaValor);
  if (dados.jurosValor !== undefined) dados.jurosValor = paraNumeroOuNull(dados.jurosValor);
  if (dados.valorLiquido !== undefined) dados.valorLiquido = paraNumeroOuNull(dados.valorLiquido);
  if (dados.recorrente !== undefined) dados.recorrente = Boolean(dados.recorrente);

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.contrato;
  delete dados.inquilino;

  return dados;

};

// contrato.arquivoDados é o PDF/foto do contrato em base64 (pode ter
// vários MB) -- sem excluir isso aqui, toda receita vinculada a um
// contrato arrastava o arquivo inteiro dele junto, só pra listar uma
// cobrança (mesmo bug do GET /contratos, ver contratoService.listar).
const SEM_ARQUIVO_DO_CONTRATO = { omit: { arquivoDados: true } };

const listar = (usuario) => {
  return prisma.receita.findMany({
    where: filtroReceita(usuario),
    include: {
      contrato: { ...SEM_ARQUIVO_DO_CONTRATO, include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id, usuario) => {
  return prisma.receita.findFirst({
    where: { id, ...filtroReceita(usuario) },
    include: {
      contrato: { ...SEM_ARQUIVO_DO_CONTRATO, include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } }
    }
  });
};

// Valor líquido NUNCA vem do front (campo só de exibição lá) -- sempre
// recalculado aqui pela taxa da conta que processa essa receita (do
// locador do contrato/inquilino, ou a conta padrão do sistema -- mesma
// resolução de gatewayPagamentoService.enviarCobranca). Só mexe quando
// "valor" também está sendo definido nesta chamada, pra uma atualização
// parcial (ex.: só marcar como paga) não recalcular por engano.
// `registroExistente` é a Receita já salva, usada como fallback de
// contratoId/inquilinoId/locadorId numa atualização parcial que não
// reenvia esses campos.
async function aplicarValorLiquidoPadrao(dados, registroExistente) {

  if (dados.valor === undefined) return dados;

  const base = { ...registroExistente, ...dados };
  const locadorId = base.locadorId || await locadorDaReceita(base);
  const kitnetId = await kitnetDaReceita(base);
  const conta = await contaPagamentoService.resolverParaKitnet(kitnetId, locadorId);
  const taxa = conta?.taxaBoletoValor || 0;

  dados.valorLiquido = Math.max(0, Math.round((dados.valor - taxa) * 100) / 100);

  return dados;

}

const criar = async (dados, autor) => {

  const modulo = extrairModulo(dados);

  dados = sanitizar(dados);
  dados = await aplicarValorLiquidoPadrao(dados);

  await campoObrigatorioService.validar(modulo, dados);

  if (await existeAluguelDuplicado(dados)) {
    throw new Error('Já existe uma cobrança de Aluguel para esse inquilino/pagador nesse mês.');
  }

  // Escolha explícita no formulário (ex.: cobrança avulsa em Nova
  // Cobrança, sem contrato/inquilino pra inferir sozinho) tem
  // prioridade e nunca é sobrescrita. Sem isso: usuário restrito a um
  // locador -- a receita é sempre dele; senão, deriva do contrato ou
  // do inquilino.
  if (!dados.locadorId) {
    if (autor?.locadorId) {
      dados.locadorId = autor.locadorId;
    } else {
      dados.locadorId = await locadorDaReceita(dados);
    }
  }

  if (dados.multaValor === undefined || dados.jurosValor === undefined) {
    const padrao = await multaJurosPadrao(dados.locadorId);
    if (dados.multaValor === undefined) dados.multaValor = padrao.multaValor;
    if (dados.jurosValor === undefined) dados.jurosValor = padrao.jurosValor;
  }

  const receita = await prisma.receita.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: receita
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    acao: "CRIAR",
    descricao: `Receita "${receita.descricao || receita.id}" criada por ${autor?.nome || "Sistema"}.`
  });

  emitirAtualizacao("receita");

  return receita;

};

const atualizar = async (id, dados, autor) => {

  // Não são campos do model -- o middleware (exigirConfirmacaoEdicaoValor)
  // já validou os dois antes de chegar aqui (permissão + motivo + senha).
  // Só sobra usar o motivo pra montar a notificação abaixo; nunca vão
  // pro prisma.receita.update.
  const motivoEdicaoValor = dados.motivoEdicaoValor;
  delete dados.motivoEdicaoValor;
  delete dados.senhaConfirmacao;

  const modulo = extrairModulo(dados);

  dados = sanitizar(dados);

  const anterior = await prisma.receita.findUnique({
    where: { id }
  });

  dados = await aplicarValorLiquidoPadrao(dados, anterior);

  // Mudou o vencimento sem dizer o status explicitamente (ex.: só
  // corrigindo uma data errada)? Recalcula sozinho se ainda deveria
  // estar Atrasada ou não, com o mesmo critério do job diário
  // (verificarVencimentosJob -- "atrasada" só a partir do dia
  // SEGUINTE ao vencimento). Sem isso, adiar o vencimento pra uma
  // data futura deixava a receita presa em "Atrasada" até o próximo
  // lote das 8h (nunca volta sozinho pra trás) -- bug relatado em
  // 11/11/2026. "dados.status === anterior?.status" cobre o
  // formulário de Editar, que sempre manda o status atual de volta
  // junto (reenviar o mesmo valor não conta como "escolher" um status
  // novo) -- só não mexe se o pedido realmente estiver MUDANDO o
  // status pra outra coisa de propósito. Nunca mexe se já estiver
  // PAGA/CANCELADA.
  if (
    dados.vencimento !== undefined &&
    (dados.status === undefined || dados.status === anterior?.status) &&
    (anterior?.status === "PENDENTE" || anterior?.status === "ATRASADA")
  ) {

    // sanitizar() (acima) já converteu dados.vencimento pra Date|null.
    if (dados.vencimento) {

      const inicioDeHoje = new Date();
      inicioDeHoje.setHours(0, 0, 0, 0);

      dados.status = dados.vencimento < inicioDeHoje ? "ATRASADA" : "PENDENTE";

    }

  }

  // Atualização parcial (ex.: só marcar como paga) não pode reprovar
  // por "faltar" um campo que já está preenchido desde a criação.
  await campoObrigatorioService.validar(modulo, { ...anterior, ...dados });

  const receita = await prisma.receita.update({
    where: { id },
    data: dados
  });

  // Reação na hora (não espera o lote de hora em hora) quando a edição
  // tira a cobrança do risco de corte -- marcar paga, cancelar, ou
  // corrigir o vencimento pro futuro (ver corteVistoriaService.js).
  // Nunca deve travar a edição em si.
  corteVistoriaService
    .resolverSeNaoCabeMais(receita.id)
    .catch((erro) => console.error('[corteVistoria] Falha ao resolver vistoria de corte:', erro.message));

  const alteracoes = diffCampos(anterior, receita, CAMPOS_RECEITA);

  // Alerta pra equipe inteira (não só log de auditoria, que ninguém
  // olha no dia a dia) -- editar uma cobrança já lançada é sensível o
  // bastante pra todo mundo saber na hora que aconteceu. Só dispara
  // quando passou pela trava de motivo+senha (exigirConfirmacaoEdicaoValor
  // -- middleware só deixa passar `motivoEdicaoValor` quando veio do
  // formulário de Editar de verdade) e realmente mudou alguma coisa.
  if (motivoEdicaoValor !== undefined && alteracoes) {

    notificacaoService.criar({
      origem: 'SISTEMA',
      titulo: 'EDIÇÃO DE COBRANÇA',
      mensagem: `${autor?.nome || 'Alguém'} editou "${receita.descricao}" (motivo: ${motivoEdicaoValor}): ${alteracoes}.`,
      link: '/financeiro',
      locadorId: await locadorIdDaReceita(receita.id),
    }).catch((erro) => console.error('[notificacao] Falha ao avisar edição de cobrança:', erro.message));

  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: receita
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    acao: "ATUALIZAR",
    descricao: `Receita "${receita.descricao || receita.id}" atualizada por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`
  });

  emitirAtualizacao("receita");

  return receita;

};

const remover = async (id, autor, motivoExclusao) => {

  const receita = await prisma.receita.findUnique({
    where: { id }
  });

  if (!receita) {
    throw new Error("Receita não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "EXCLUIR",
    valorAnterior: receita,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    acao: "EXCLUIR",
    descricao: `Receita "${receita.descricao || receita.id}" excluída por ${autor?.nome || "Sistema"}${motivoExclusao ? ` (motivo: ${motivoExclusao})` : ""}.`
  });

  // Mesmo alerta pra equipe inteira que a mudança de valor já dispara
  // (ver atualizar() acima) -- excluir um boleto de vez é ainda mais
  // definitivo, ninguém pode descobrir isso só olhando o log de
  // auditoria, que não é o que o time olha no dia a dia.
  notificacaoService.criar({
    origem: 'SISTEMA',
    titulo: 'EXCLUSÃO DE BOLETO',
    mensagem: `${autor?.nome || 'Alguém'} excluiu "${receita.descricao}" (R$ ${Number(receita.valor).toFixed(2)})${motivoExclusao ? ` -- motivo: ${motivoExclusao}` : ""}.`,
    link: '/financeiro',
    locadorId: await locadorIdDaReceita(receita.id),
  }).catch((erro) => console.error('[notificacao] Falha ao avisar exclusão de boleto:', erro.message));

  // A receita está deixando de existir -- a vistoria de corte que ela
  // gerou (se tiver) nunca pode ficar órfã e aberta pra sempre.
  await corteVistoriaService
    .cancelarVinculada(receita.id)
    .catch((erro) => console.error('[corteVistoria] Falha ao cancelar vistoria vinculada:', erro.message));

  const removida = await prisma.receita.delete({
    where: { id }
  });

  emitirAtualizacao("receita");

  return removida;

};

// Pro front mostrar a conta/taxa que vai valer ANTES de salvar --
// mesma resolução usada de verdade na criação (locadorDaReceita +
// contaPagamentoService), só que sem gravar nada.
const previsaoTaxaBoleto = async ({ inquilinoId, contratoId }) => {

  const locadorId = await locadorDaReceita({ inquilinoId, contratoId });
  const kitnetId = await kitnetDaReceita({ inquilinoId, contratoId });
  const conta = await contaPagamentoService.resolverParaKitnet(kitnetId, locadorId);

  return {
    contaNome: conta?.nome || null,
    taxaBoletoValor: conta?.taxaBoletoValor || 0,
  };

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  previsaoTaxaBoleto,
  kitnetDaReceita,
  multaJurosPadrao,
  existeAluguelDuplicado
};