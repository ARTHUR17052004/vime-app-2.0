const prisma = require("../config/prisma");
const { filtroReceita, filtroKitnet, filtroUnidade, filtroContrato, filtroSolicitacao, filtroVistoria } = require("../utils/escopoLocador");
const campoObrigatorioService = require("./campoObrigatorioService");
const { MS_LIMITE } = require("../utils/prazoAlerta");

/*
  VIME Insights -- Fase 1/2 (sem IA ainda): números corretos, com
  referência de navegação estruturada (href + query), reaproveitando
  as MESMAS definições que o resto do sistema já usa (dashboardService,
  verificarVencimentosJob) -- nunca inventa um corte de data novo sem
  necessidade, pra não divergir do que a tela de Financeiro já mostra.

  `escopoLocador.filtroReceita` garante o mesmo recorte por locador que
  todo o resto do financeiro já respeita -- um usuário restrito nunca
  vê (nem navega para) receita de fora do seu locador.
*/

// "A vencer em breve" não tem definição prévia no sistema (o único
// prazo parecido que já existe é o de CONTRATO vencendo, 10 dias --
// domínio diferente). 7 dias foi o palpite inicial; ajustar junto com
// o usuário se não for o período certo.
const DIAS_A_VENCER = 7;

function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function inicioMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function fimMes(data) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);
}

function periodoAnteriorDe(inicio, fim) {
  const duracaoMs = fim.getTime() - inicio.getTime();
  return {
    inicio: new Date(inicio.getTime() - duracaoMs - 1),
    fim: new Date(inicio.getTime() - 1),
  };
}

// Monta "AAAA-MM-DD" a partir dos componentes locais do Date, não de
// toISOString() -- esse converte pra UTC antes de formatar, e como o
// servidor roda em horário local negativo (-03:00), isso empurrava a
// data exibida um dia pra frente (ex.: 30/09 virava "2026-10-01").
function dataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const resumoFinanceiro = async (usuario, { inicio, fim } = {}) => {

  const agora = new Date();
  const periodoInicio = inicio ? inicioDoDia(new Date(inicio)) : inicioMes(agora);
  const periodoFim = fim ? new Date(new Date(fim).setHours(23, 59, 59, 999)) : fimMes(agora);

  const { inicio: anteriorInicio, fim: anteriorFim } = periodoAnteriorDe(periodoInicio, periodoFim);

  const escopo = filtroReceita(usuario);

  const limiteAVencer = new Date(agora.getTime() + DIAS_A_VENCER * 24 * 60 * 60 * 1000);

  const [
    recebidoPeriodo,
    recebidoAnterior,
    previstoPeriodo,
    vencidas,
    aVencer,
    pendentesTotal,
  ] = await Promise.all([

    prisma.receita.aggregate({
      where: { ...escopo, status: "PAGA", dataPagamento: { gte: periodoInicio, lte: periodoFim } },
      _sum: { valor: true },
      _count: true,
    }),

    prisma.receita.aggregate({
      where: { ...escopo, status: "PAGA", dataPagamento: { gte: anteriorInicio, lte: anteriorFim } },
      _sum: { valor: true },
    }),

    // "Previsto" = tudo que tinha vencimento dentro do período e não
    // foi cancelado -- inclui o que já foi pago, o que ainda está
    // pendente e o que venceu sem pagar (visão "o que deveria entrar").
    prisma.receita.aggregate({
      where: { ...escopo, status: { not: "CANCELADA" }, vencimento: { gte: periodoInicio, lte: periodoFim } },
      _sum: { valor: true },
      _count: true,
    }),

    // Mesma definição de "vencida" que dashboardService.alertas() e o
    // job verificarVencimentosJob já usam: Receita.status === ATRASADA.
    // Sem recorte de período de propósito -- é uma cobrança em aberto
    // agora, não algo que "aconteceu" dentro de um mês específico.
    prisma.receita.aggregate({
      where: { ...escopo, status: "ATRASADA" },
      _sum: { valor: true },
      _count: true,
    }),

    prisma.receita.aggregate({
      where: { ...escopo, status: "PENDENTE", vencimento: { gte: agora, lte: limiteAVencer } },
      _sum: { valor: true },
      _count: true,
    }),

    // Diferente de "a vencer": aqui é TODO pendente, sem corte de data
    // -- inclui pendentes com vencimento mais distante que os 7 dias
    // acima.
    prisma.receita.aggregate({
      where: { ...escopo, status: "PENDENTE" },
      _sum: { valor: true },
      _count: true,
    }),

  ]);

  const valorRecebido = recebidoPeriodo._sum.valor || 0;
  const valorRecebidoAnterior = recebidoAnterior._sum.valor || 0;

  const variacaoPercentual =
    valorRecebidoAnterior > 0
      ? Math.round(((valorRecebido - valorRecebidoAnterior) / valorRecebidoAnterior) * 1000) / 10
      : null;

  return {

    periodo: { inicio: dataISO(periodoInicio), fim: dataISO(periodoFim) },
    periodoAnterior: { inicio: dataISO(anteriorInicio), fim: dataISO(anteriorFim) },
    geradoEm: new Date().toISOString(),

    indicadores: [

      {
        chave: "recebido_periodo",
        rotulo: "Recebido no período",
        valor: valorRecebido,
        formato: "moeda",
        quantidade: recebidoPeriodo._count,
        // "periodo": muda conforme o mês escolhido no navegador de
        // período. "atual": é sempre uma foto de agora, não respeita o
        // período selecionado -- o front precisa diferenciar na hora de
        // mostrar, senão parece que o número "não bateu" com o mês.
        escopo: "periodo",
        criterio: `Soma das receitas com status "Paga" cuja data de pagamento caiu entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}.`,
        comparacao: {
          valorAnterior: valorRecebidoAnterior,
          variacaoPercentual,
        },
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "PAGA", de: dataISO(periodoInicio), ate: dataISO(periodoFim) },
        },
      },

      {
        chave: "previsto_periodo",
        rotulo: "Previsto no período",
        valor: previstoPeriodo._sum.valor || 0,
        formato: "moeda",
        quantidade: previstoPeriodo._count,
        escopo: "periodo",
        criterio: `Soma de todas as receitas (pagas, pendentes ou atrasadas -- exceto canceladas) com vencimento entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}.`,
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", de: dataISO(periodoInicio), ate: dataISO(periodoFim) },
        },
      },

      {
        chave: "cobrancas_vencidas",
        rotulo: "Cobranças vencidas",
        valor: vencidas._sum.valor || 0,
        formato: "moeda",
        quantidade: vencidas._count,
        escopo: "atual",
        criterio: "Soma das receitas com status \"Atrasada\" neste momento -- mesma regra que já dispara os alertas do Dashboard e o job diário de vencimentos. Não depende do período escolhido acima.",
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "ATRASADA" },
        },
      },

      {
        chave: "cobrancas_a_vencer",
        rotulo: `Cobranças a vencer (${DIAS_A_VENCER} dias)`,
        valor: aVencer._sum.valor || 0,
        formato: "moeda",
        quantidade: aVencer._count,
        escopo: "atual",
        criterio: `Soma das receitas "Pendente" com vencimento entre hoje (${dataISO(agora)}) e os próximos ${DIAS_A_VENCER} dias (${dataISO(limiteAVencer)}). Prazo definido pelo VIME Insights -- ainda não existia em outro lugar do sistema.`,
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "PENDENTE", de: dataISO(agora), ate: dataISO(limiteAVencer) },
        },
      },

      {
        chave: "pagamentos_pendentes",
        rotulo: "Pagamentos pendentes",
        valor: pendentesTotal._sum.valor || 0,
        formato: "moeda",
        quantidade: pendentesTotal._count,
        escopo: "atual",
        criterio: "Soma de todas as receitas com status \"Pendente\", sem corte de data -- inclui as que vencem nos próximos dias (acima) e as que vencem mais à frente.",
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "PENDENTE" },
        },
      },

    ],

  };

};

// Campo -> { tipo, nullable }, direto do schema.prisma: o Prisma rejeita
// comparar `null` com um campo NOT NULL (vira "Argument X is missing"),
// então um campo sem `?` no schema nunca entra na checagem de null --
// só os que realmente podem ficar vazios no banco. Campo numérico
// obrigatório sem ser nullable (ex.: Kitnet.aluguel) não tem como
// detectar "faltando" por aqui -- o próprio banco já garante que tem
// algum valor -- então fica de fora da checagem.
const CAMPOS_KITNET = {
  aluguel: { tipo: "numero", nullable: false },
  metragem: { tipo: "numero", nullable: false },
  numero: { tipo: "texto", nullable: false },
  nome: { tipo: "texto", nullable: true },
  status: { tipo: "texto", nullable: false },
};

const CAMPOS_RESIDENCIA = {
  vencimento: { tipo: "numero", nullable: true },
  nome: { tipo: "texto", nullable: false },
  cidade: { tipo: "texto", nullable: false },
  uf: { tipo: "texto", nullable: false },
  kitnets: { tipo: "numero", nullable: false },
  status: { tipo: "texto", nullable: false },
  cep: { tipo: "texto", nullable: true },
  logradouro: { tipo: "texto", nullable: true },
  bairro: { tipo: "texto", nullable: true },
  locadorId: { tipo: "texto", nullable: true },
  aluguel: { tipo: "numero", nullable: true },
};

const DEFINICOES_CAMPO = { kitnet: CAMPOS_KITNET, residencia: CAMPOS_RESIDENCIA };

// Devolve a condição pra esse campo, ou null se não dá pra checar
// (numérico não-nulo -- nunca "vazio" do jeito que o banco permite).
function condicaoVazio(campo, def) {
  if (!def) return { [campo]: "" }; // campo desconhecido: assume texto, melhor esforço
  if (def.tipo === "numero") return def.nullable ? { [campo]: null } : null;
  return def.nullable ? { OR: [{ [campo]: null }, { [campo]: "" }] } : { [campo]: "" };
}

// Conta quantos registros estão faltando QUALQUER campo que o admin
// marcou como obrigatório pro módulo (Administração > Campos
// Obrigatórios -- mesma config que já trava o cadastro/edição). Sem
// nenhum campo configurado (ou nenhum checável), não há "incompleto"
// possível: devolve 0.
async function contarIncompletos(prismaModel, modulo, escopo) {

  const configurados = await campoObrigatorioService.listarPorModulo(modulo);
  const obrigatorios = configurados.filter((c) => c.obrigatorio).map((c) => c.campo);

  const condicoes = obrigatorios
    .map((campo) => condicaoVazio(campo, DEFINICOES_CAMPO[modulo]?.[campo]))
    .filter(Boolean);

  if (condicoes.length === 0) return 0;

  return prismaModel.count({ where: { ...escopo, OR: condicoes } });

}

const resumoImoveis = async (usuario) => {

  const escopoKitnet = filtroKitnet(usuario);
  const escopoUnidade = filtroUnidade(usuario);

  const [
    totalUnidades,
    totalKitnets,
    kitnetsOcupadas,
    kitnetsVazias,
    kitnetsIncompletas,
    unidadesIncompletas,
  ] = await Promise.all([
    prisma.unidade.count({ where: escopoUnidade }),
    prisma.kitnet.count({ where: escopoKitnet }),
    prisma.kitnet.count({ where: { ...escopoKitnet, status: "OCUPADA" } }),
    prisma.kitnet.count({ where: { ...escopoKitnet, status: "DISPONIVEL" } }),
    contarIncompletos(prisma.kitnet, "kitnet", escopoKitnet),
    contarIncompletos(prisma.unidade, "residencia", escopoUnidade),
  ]);

  const percentualOcupacao = totalKitnets > 0 ? Math.round((kitnetsOcupadas / totalKitnets) * 100) : 0;

  return {

    geradoEm: new Date().toISOString(),

    indicadores: [

      {
        chave: "residencias_total",
        rotulo: "Residências cadastradas",
        valor: totalUnidades,
        formato: "numero",
        quantidade: totalUnidades,
        escopo: "atual",
        criterio: "Total de residências (Unidades) cadastradas no sistema.",
        navegacao: { href: "/unidades", query: {} },
      },

      {
        chave: "kitnets_total",
        rotulo: "Kitnets cadastradas",
        valor: totalKitnets,
        formato: "numero",
        quantidade: totalKitnets,
        escopo: "atual",
        criterio: "Total de kitnets cadastradas, de todas as residências.",
        navegacao: { href: "/kitnets", query: {} },
      },

      {
        chave: "kitnets_ocupadas",
        rotulo: "Kitnets ocupadas",
        valor: kitnetsOcupadas,
        formato: "numero",
        quantidade: kitnetsOcupadas,
        escopo: "atual",
        criterio: "Kitnets com status \"Ocupada\" -- mesma definição que a tela de Kitnets já usa.",
        navegacao: { href: "/kitnets", query: { status: "OCUPADA" } },
      },

      {
        chave: "kitnets_vazias",
        rotulo: "Kitnets disponíveis",
        valor: kitnetsVazias,
        formato: "numero",
        quantidade: kitnetsVazias,
        escopo: "atual",
        criterio: "Kitnets com status \"Disponível\" -- prontas pra locação, mesma definição do alerta de \"kitnet vazia\".",
        navegacao: { href: "/kitnets", query: { status: "DISPONIVEL" } },
      },

      {
        chave: "taxa_ocupacao",
        rotulo: "Taxa de ocupação",
        valor: percentualOcupacao,
        formato: "percentual",
        quantidade: totalKitnets,
        escopo: "atual",
        criterio: "Kitnets ocupadas dividido pelo total de kitnets, em porcentagem.",
        navegacao: { href: "/kitnets", query: {} },
      },

      {
        chave: "imoveis_incompletos",
        rotulo: "Imóveis com dados incompletos",
        valor: kitnetsIncompletas + unidadesIncompletas,
        formato: "numero",
        quantidade: kitnetsIncompletas + unidadesIncompletas,
        escopo: "atual",
        criterio: `Kitnets (${kitnetsIncompletas}) e residências (${unidadesIncompletas}) com algum campo em branco que o admin marcou como obrigatório em Administração > Campos Obrigatórios. Clicar leva pra Kitnets -- a lista não filtra só as incompletas ainda.`,
        navegacao: { href: "/kitnets", query: {} },
      },

    ],

  };

};

// Mesmo prazo que contratoService.js (DIAS_ALERTA_VENCIMENTO) já usa
// pra avisar de contrato vencendo -- reaproveitado aqui de propósito,
// não é um número novo escolhido pelo Insights.
const DIAS_CONTRATO_VENCENDO = 10;

const resumoContratos = async (usuario) => {

  const escopo = filtroContrato(usuario);

  const hoje = new Date();
  const emDiasVencendo = new Date(hoje.getTime() + DIAS_CONTRATO_VENCENDO * 24 * 60 * 60 * 1000);

  const [vigentes, vencendo, pendentes, encerrados] = await Promise.all([

    prisma.contrato.count({ where: { ...escopo, status: "ATIVO" } }),

    // Mesma regra de contratoService.notificarSeVencimentoProximo:
    // ATIVO com dataFim dentro dos próximos 10 dias.
    prisma.contrato.count({
      where: { ...escopo, status: "ATIVO", dataFim: { not: null, gte: hoje, lte: emDiasVencendo } },
    }),

    // PENDENTE = aguardando assinatura (enviado pra Clicksign ou nem
    // isso ainda) -- é a "pendência" real do contrato, não um estado de
    // erro.
    prisma.contrato.count({ where: { ...escopo, status: "PENDENTE" } }),

    prisma.contrato.count({ where: { ...escopo, status: "ENCERRADO" } }),

  ]);

  return {

    geradoEm: new Date().toISOString(),

    indicadores: [

      {
        chave: "contratos_vigentes",
        rotulo: "Contratos vigentes",
        valor: vigentes,
        formato: "numero",
        quantidade: vigentes,
        escopo: "atual",
        criterio: "Contratos com status \"Ativo\" neste momento.",
        navegacao: { href: "/contratos", query: { status: "ATIVO" } },
      },

      {
        chave: "contratos_vencendo",
        rotulo: `Vencendo em até ${DIAS_CONTRATO_VENCENDO} dias`,
        valor: vencendo,
        formato: "numero",
        quantidade: vencendo,
        escopo: "atual",
        criterio: `Contratos "Ativo" cujo fim de vigência cai nos próximos ${DIAS_CONTRATO_VENCENDO} dias -- mesmo prazo que já dispara o aviso de vencimento próximo em Contratos.`,
        navegacao: { href: "/contratos", query: { status: "ATIVO" } },
      },

      {
        chave: "contratos_pendentes",
        rotulo: "Aguardando assinatura",
        valor: pendentes,
        formato: "numero",
        quantidade: pendentes,
        escopo: "atual",
        criterio: "Contratos com status \"Pendente\" -- ainda não foram assinados (enviados ou não pra Clicksign).",
        navegacao: { href: "/contratos", query: { status: "PENDENTE" } },
      },

      {
        chave: "contratos_encerrados",
        rotulo: "Contratos encerrados",
        valor: encerrados,
        formato: "numero",
        quantidade: encerrados,
        escopo: "atual",
        criterio: "Contratos com status \"Encerrado\".",
        navegacao: { href: "/contratos", query: { status: "ENCERRADO" } },
      },

    ],

  };

};

// Mesmos status que verificarSolicitacoesAtrasadasJob.js considera
// "encerrado" -- solicitação resolvida ou rejeitada não conta mais
// como aberta.
const STATUS_SOLICITACAO_ENCERRADOS = ["ATENDIDA", "REJEITADA"];

const resumoSolicitacoesVistorias = async (usuario) => {

  const escopoSolicitacao = filtroSolicitacao(usuario);
  const escopoVistoria = filtroVistoria(usuario);

  const agora = new Date();
  const limiteAtraso = new Date(agora.getTime() - MS_LIMITE);

  const [
    solicitacoesAbertas,
    solicitacoesAtrasadas,
    vistoriasAgendadas,
    vistoriasPendentes,
    vistoriasAtrasadas,
    ocorrenciasRegistradas,
  ] = await Promise.all([

    prisma.solicitacao.count({
      where: { ...escopoSolicitacao, status: { notIn: STATUS_SOLICITACAO_ENCERRADOS } },
    }),

    // Mesma regra de verificarSolicitacoesAtrasadasJob.js: aberta E com
    // prazo vencido há mais de 72h (tolerância padrão do sistema).
    prisma.solicitacao.count({
      where: {
        ...escopoSolicitacao,
        status: { notIn: STATUS_SOLICITACAO_ENCERRADOS },
        prazo: { not: null, lte: limiteAtraso },
      },
    }),

    prisma.vistoria.count({ where: { ...escopoVistoria, status: "PROGRAMADA" } }),
    prisma.vistoria.count({ where: { ...escopoVistoria, status: "PENDENTE" } }),
    prisma.vistoria.count({ where: { ...escopoVistoria, status: "ATRASADA" } }),

    prisma.ocorrencia.count({ where: { vistoria: escopoVistoria } }),

  ]);

  return {

    geradoEm: new Date().toISOString(),

    indicadores: [

      {
        chave: "solicitacoes_abertas",
        rotulo: "Solicitações abertas",
        valor: solicitacoesAbertas,
        formato: "numero",
        quantidade: solicitacoesAbertas,
        escopo: "atual",
        criterio: "Solicitações com status diferente de \"Atendida\" ou \"Rejeitada\" -- mesma definição usada no Dashboard e no job de prazo vencido.",
        navegacao: { href: "/solicitacoes", query: { aba: "abertas" } },
      },

      {
        chave: "solicitacoes_atrasadas",
        rotulo: "Solicitações atrasadas",
        valor: solicitacoesAtrasadas,
        formato: "numero",
        quantidade: solicitacoesAtrasadas,
        escopo: "atual",
        criterio: "Solicitações abertas cujo prazo venceu há mais de 72h -- mesma tolerância que o alerta automático de prazo vencido já usa. A lista em Solicitações ainda não abre pré-filtrada por este número.",
        navegacao: { href: "/solicitacoes", query: {} },
      },

      {
        chave: "vistorias_agendadas",
        rotulo: "Vistorias agendadas",
        valor: vistoriasAgendadas,
        formato: "numero",
        quantidade: vistoriasAgendadas,
        escopo: "atual",
        criterio: "Vistorias com status \"Programada\" -- prazo confortável, mais de 72h de folga.",
        navegacao: { href: "/vistorias", query: { aba: "agendadas" } },
      },

      {
        chave: "vistorias_pendentes",
        rotulo: "Vistorias pendentes",
        valor: vistoriasPendentes,
        formato: "numero",
        quantidade: vistoriasPendentes,
        escopo: "atual",
        criterio: "Vistorias com status \"Pendente\" -- faltam 72h ou menos pro prazo.",
        navegacao: { href: "/vistorias", query: { aba: "pendentes" } },
      },

      {
        chave: "vistorias_atrasadas",
        rotulo: "Vistorias atrasadas",
        valor: vistoriasAtrasadas,
        formato: "numero",
        quantidade: vistoriasAtrasadas,
        escopo: "atual",
        criterio: "Vistorias com status \"Atrasada\" -- o prazo já venceu sem resposta.",
        navegacao: { href: "/vistorias", query: { aba: "atrasadas" } },
      },

      {
        chave: "ocorrencias_registradas",
        rotulo: "Ocorrências registradas",
        valor: ocorrenciasRegistradas,
        formato: "numero",
        quantidade: ocorrenciasRegistradas,
        escopo: "atual",
        criterio: "Total de ocorrências (problemas/achados) anotadas em vistorias, de todas as datas.",
        navegacao: { href: "/vistorias", query: {} },
      },

    ],

  };

};

module.exports = { resumoFinanceiro, resumoImoveis, resumoContratos, resumoSolicitacoesVistorias };
