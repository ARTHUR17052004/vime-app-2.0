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

const LIMITE_HISTORICO_OCUPACAO = 400; // folga confortável acima de 1 ano de snapshots diários

// Taxa de ocupação não tem como ser reconstruída pra datas antigas
// (Kitnet.status só reflete agora, sem histórico) -- por isso só
// existe a partir de quando o snapshotOcupacaoJob passou a rodar
// (1x por dia). Período anterior a isso simplesmente não tem dado:
// a ferramenta devolve um aviso em vez de inventar número.
// "AAAA-MM-DD" direto no construtor do Date vira meia-noite UTC -- no
// fuso -03:00 do servidor isso quase sempre bate certo pro gte, mas
// pro lte cortava fora o snapshot do próprio dia escolhido (salvo às
// 03:00 UTC, depois da meia-noite UTC usada como limite). Monta a
// data pelos componentes locais pra não depender de fuso nenhum.
function dataLocalDoISO(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return new Date(valor);
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

async function historicoOcupacao(usuario, { data_inicio, data_fim } = {}) {

  const where = { locadorId: usuario?.locadorId || null };

  if (data_inicio || data_fim) {
    where.data = {};
    if (data_inicio) where.data.gte = dataLocalDoISO(data_inicio);
    if (data_fim) where.data.lte = new Date(dataLocalDoISO(data_fim).setHours(23, 59, 59, 999));
  }

  const registros = await prisma.snapshotOcupacao.findMany({
    where,
    orderBy: { data: "asc" },
    take: LIMITE_HISTORICO_OCUPACAO,
  });

  if (registros.length === 0) {
    return {
      aviso: "Nenhum snapshot de ocupação guardado para esse período -- o histórico só existe a partir do dia em que essa funcionalidade foi criada (1 fotografia por dia). Não invente um número pra isso, diga que não tem esse dado.",
    };
  }

  return registros.map((r) => ({
    data: r.data.toISOString().slice(0, 10),
    kitnetsTotal: r.kitnetsTotal,
    kitnetsOcupadas: r.kitnetsOcupadas,
    taxaOcupacao: r.taxaOcupacao,
  }));

}

// Definição no formato "tools" da OpenAI/Groq -- nome aqui tem que
// bater exatamente com a chave em EXECUTORES abaixo.
//
// Todo parâmetro opcional aceita null além do tipo de verdade --
// alguns modelos (confirmado no gpt-oss-120b via Groq) preenchem
// parâmetro opcional que não vem ao caso com `null` explícito em vez
// de simplesmente omitir a chave, e um schema só com "string" rejeita
// isso com erro 400 ("expected string, but got null") antes mesmo da
// ferramenta rodar.
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
          periodo_inicio: { type: ["string", "null"], description: "Data inicial AAAA-MM-DD (opcional, padrão início do mês atual)" },
          periodo_fim: { type: ["string", "null"], description: "Data final AAAA-MM-DD (opcional, padrão fim do mês atual)" },
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
          status: { type: ["string", "null"], enum: ["ATIVO", "PENDENTE", "ENCERRADO", null], description: "Filtrar por status (opcional)" },
          vencendo_em_dias: { type: ["number", "null"], description: "Só contratos ativos vencendo em até N dias (opcional, ignora 'status' se usado)" },
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
          status: { type: ["string", "null"], enum: ["PENDENTE", "PAGA", "ATRASADA", "CANCELADA", null], description: "Filtrar por status (opcional)" },
          de: { type: ["string", "null"], description: "Vencimento a partir de AAAA-MM-DD (opcional)" },
          ate: { type: ["string", "null"], description: "Vencimento até AAAA-MM-DD (opcional)" },
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
          status: { type: ["string", "null"], enum: ["PROGRAMADA", "PENDENTE", "ATRASADA", "REALIZADA", "CANCELADA", null], description: "Filtrar por status (opcional)" },
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
          status: { type: ["string", "null"], description: "Filtrar por status (opcional, ex.: SOLICITADA, EM_ANDAMENTO, ATENDIDA, REJEITADA)" },
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
          status: { type: ["string", "null"], enum: ["DISPONIVEL", "OCUPADA", "MANUTENCAO", "INDISPONIVEL", null], description: "Filtrar por status (opcional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "historico_ocupacao",
      description:
        "Retorna a taxa de ocupação de kitnets por dia (1 fotografia/dia), pra perguntas sobre ocupação em datas passadas ou evolução ao longo do tempo. Só existe a partir do dia em que essa funcionalidade foi criada -- datas antes disso não têm dado, e a resposta vem com um aviso nesse caso (nunca invente o número).",
      parameters: {
        type: "object",
        properties: {
          data_inicio: { type: ["string", "null"], description: "Data inicial AAAA-MM-DD (opcional)" },
          data_fim: { type: ["string", "null"], description: "Data final AAAA-MM-DD (opcional)" },
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
  historico_ocupacao: historicoOcupacao,
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
