const prisma = require("../config/prisma");
const { filtroReceita } = require("../utils/escopoLocador");

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
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "PENDENTE" },
        },
      },

    ],

  };

};

module.exports = { resumoFinanceiro };
