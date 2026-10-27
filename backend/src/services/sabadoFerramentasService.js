const prisma = require("../config/prisma");
const {
  filtroReceita,
  filtroKitnet,
  filtroContrato,
  filtroSolicitacao,
  filtroVistoria,
} = require("../utils/escopoLocador");
const insightsService = require("./insightsService");

/*
  Ferramentas que o SABADO pode chamar durante o chat ("Pergunte ao
  VIME") pra buscar dado REAL e específico -- nunca inventado -- antes
  de responder. Cada função aqui é só leitura (findMany/count), sempre
  com o mesmo filtro por locador que o resto do sistema já respeita
  (escopoLocador), e sempre limitada a um número pequeno de registros
  -- o chat é pra responder "quais" e "quantos", não exportar o banco
  inteiro pro prompt.
*/

const LIMITE_LISTA = 25;

function enxugarIndicadores(indicadores) {
  return indicadores.map(({ chave, rotulo, valor, formato, escopo, criterio, comparacao }) => ({
    chave, rotulo, valor, formato, escopo, criterio,
    ...(comparacao ? { comparacao } : {}),
  }));
}

async function visaoGeral(usuario, { periodo_inicio, periodo_fim } = {}) {

  const [financeiro, imoveis, contratos, solicitacoesVistorias] = await Promise.all([
    insightsService.resumoFinanceiro(usuario, { inicio: periodo_inicio, fim: periodo_fim }),
    insightsService.resumoImoveis(usuario),
    insightsService.resumoContratos(usuario),
    insightsService.resumoSolicitacoesVistorias(usuario),
  ]);

  return {
    periodo: financeiro.periodo,
    financeiro: enxugarIndicadores(financeiro.indicadores),
    imoveis: enxugarIndicadores(imoveis.indicadores),
    contratos: enxugarIndicadores(contratos.indicadores),
    solicitacoesVistorias: enxugarIndicadores(solicitacoesVistorias.indicadores),
  };

}

async function listarContratos(usuario, { status, vencendo_em_dias } = {}) {

  const where = { ...filtroContrato(usuario) };

  if (vencendo_em_dias) {
    const hoje = new Date();
    const limite = new Date(hoje.getTime() + Number(vencendo_em_dias) * 24 * 60 * 60 * 1000);
    where.status = "ATIVO";
    where.dataFim = { not: null, gte: hoje, lte: limite };
  } else if (status) {
    where.status = status;
  }

  const contratos = await prisma.contrato.findMany({
    where,
    take: LIMITE_LISTA,
    orderBy: { dataFim: "asc" },
    select: {
      status: true,
      dataInicio: true,
      dataFim: true,
      valorAluguel: true,
      diaVencimento: true,
      inquilino: { select: { nome: true } },
      kitnet: { select: { numero: true, unidade: { select: { nome: true } } } },
    },
  });

  return contratos.map((c) => ({
    inquilino: c.inquilino?.nome || null,
    imovel: c.kitnet ? `${c.kitnet.unidade?.nome} - Kitnet ${c.kitnet.numero}` : null,
    status: c.status,
    dataInicio: c.dataInicio,
    dataFim: c.dataFim,
    valorAluguel: c.valorAluguel,
    diaVencimento: c.diaVencimento,
  }));

}

async function listarCobrancas(usuario, { status, de, ate } = {}) {

  const where = { ...filtroReceita(usuario) };

  if (status) where.status = status;

  if (de || ate) {
    where.vencimento = {};
    if (de) where.vencimento.gte = new Date(de);
    if (ate) where.vencimento.lte = new Date(`${ate}T23:59:59`);
  }

  const receitas = await prisma.receita.findMany({
    where,
    take: LIMITE_LISTA,
    orderBy: { vencimento: "asc" },
    select: {
      descricao: true,
      categoria: true,
      valor: true,
      vencimento: true,
      dataPagamento: true,
      status: true,
      pagadorNome: true,
      inquilino: { select: { nome: true } },
    },
  });

  return receitas.map((r) => ({
    pagador: r.inquilino?.nome || r.pagadorNome || null,
    descricao: r.descricao,
    categoria: r.categoria,
    valor: r.valor,
    vencimento: r.vencimento,
    dataPagamento: r.dataPagamento,
    status: r.status,
  }));

}

async function listarVistorias(usuario, { status } = {}) {

  const where = { ...filtroVistoria(usuario) };

  if (status) where.status = status;

  const vistorias = await prisma.vistoria.findMany({
    where,
    take: LIMITE_LISTA,
    orderBy: { dataProxima: "asc" },
    select: {
      titulo: true,
      status: true,
      criticidade: true,
      responsavel: true,
      dataUltima: true,
      dataProxima: true,
      unidade: { select: { nome: true } },
      kitnet: { select: { numero: true, unidade: { select: { nome: true } } } },
    },
  });

  return vistorias.map((v) => ({
    titulo: v.titulo,
    imovel: v.kitnet
      ? `${v.kitnet.unidade?.nome} - Kitnet ${v.kitnet.numero}`
      : v.unidade?.nome || "Geral (várias residências)",
    status: v.status,
    criticidade: v.criticidade,
    responsavel: v.responsavel,
    dataUltima: v.dataUltima,
    dataProxima: v.dataProxima,
  }));

}

async function listarSolicitacoes(usuario, { status } = {}) {

  const where = { ...filtroSolicitacao(usuario) };

  if (status) where.status = status;

  const solicitacoes = await prisma.solicitacao.findMany({
    where,
    take: LIMITE_LISTA,
    orderBy: { prazo: "asc" },
    select: {
      numero: true,
      titulo: true,
      responsavel: true,
      data: true,
      prazo: true,
      status: true,
    },
  });

  return solicitacoes;

}

async function listarKitnets(usuario, { status } = {}) {

  const where = { ...filtroKitnet(usuario) };

  if (status) where.status = status;

  const kitnets = await prisma.kitnet.findMany({
    where,
    take: LIMITE_LISTA,
    orderBy: { numero: "asc" },
    select: {
      numero: true,
      status: true,
      aluguel: true,
      metragem: true,
      unidade: { select: { nome: true } },
      inquilinos: { where: { ativo: true }, select: { nome: true }, take: 1 },
    },
  });

  return kitnets.map((k) => ({
    imovel: `${k.unidade?.nome} - Kitnet ${k.numero}`,
    status: k.status,
    aluguel: k.aluguel,
    metragem: k.metragem,
    inquilinoAtual: k.inquilinos[0]?.nome || null,
  }));

}

// Definição no formato "tools" da OpenAI/Groq -- nome aqui tem que
// bater exatamente com a chave em EXECUTORES abaixo.
const FERRAMENTAS = [
  {
    type: "function",
    function: {
      name: "visao_geral",
      description:
        "Retorna os indicadores agregados (financeiro, imóveis/kitnets, contratos, solicitações e vistorias) já calculados pelo sistema. Use primeiro, pra perguntas gerais ou que envolvam números totais/percentuais.",
      parameters: {
        type: "object",
        properties: {
          periodo_inicio: { type: "string", description: "Data inicial AAAA-MM-DD (opcional, padrão início do mês atual)" },
          periodo_fim: { type: "string", description: "Data final AAAA-MM-DD (opcional, padrão fim do mês atual)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_contratos",
      description: "Lista contratos reais (inquilino, imóvel, datas, valor, status). Use pra perguntas sobre QUAIS contratos, não só quantos.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ATIVO", "PENDENTE", "ENCERRADO"], description: "Filtrar por status (opcional)" },
          vencendo_em_dias: { type: "number", description: "Só contratos ativos vencendo em até N dias (opcional, ignora 'status' se usado)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_cobrancas",
      description: "Lista cobranças/receitas reais (pagador, descrição, valor, vencimento, status). Use pra perguntas sobre QUAIS cobranças, não só quanto.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["PENDENTE", "PAGA", "ATRASADA", "CANCELADA"], description: "Filtrar por status (opcional)" },
          de: { type: "string", description: "Vencimento a partir de AAAA-MM-DD (opcional)" },
          ate: { type: "string", description: "Vencimento até AAAA-MM-DD (opcional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_vistorias",
      description: "Lista vistorias reais (título, imóvel, responsável, datas, status).",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["PROGRAMADA", "PENDENTE", "ATRASADA", "REALIZADA", "CANCELADA"], description: "Filtrar por status (opcional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_solicitacoes",
      description: "Lista solicitações reais (número, título, responsável, prazo, status).",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filtrar por status (opcional, ex.: SOLICITADA, EM_ANDAMENTO, ATENDIDA, REJEITADA)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_kitnets",
      description: "Lista kitnets reais (imóvel, status, aluguel, metragem, inquilino atual).",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["DISPONIVEL", "OCUPADA", "MANUTENCAO", "INDISPONIVEL"], description: "Filtrar por status (opcional)" },
        },
      },
    },
  },
];

const EXECUTORES = {
  visao_geral: visaoGeral,
  listar_contratos: listarContratos,
  listar_cobrancas: listarCobrancas,
  listar_vistorias: listarVistorias,
  listar_solicitacoes: listarSolicitacoes,
  listar_kitnets: listarKitnets,
};

async function executar(nome, usuario, argumentos) {

  const executor = EXECUTORES[nome];

  if (!executor) {
    return { erro: `Ferramenta "${nome}" não existe.` };
  }

  try {
    return await executor(usuario, argumentos || {});
  } catch (error) {
    return { erro: `Falha ao consultar: ${error.message}` };
  }

}

module.exports = { FERRAMENTAS, executar };
