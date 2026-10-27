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

// "AAAA-MM-DD" (query ?inicio=/?fim= vindo do front) interpretado pelo
// construtor do Date vira meia-noite UTC -- num fuso atrás de UTC
// (Brasil, servidor roda em -03:00) isso "volta" um dia quando o resto
// do código lê os componentes locais depois (ex.: inicioDoDia faz
// setHours(0,0,0,0) em cima de um Date que já virou o dia anterior às
// 21h local). Monta a data a partir dos componentes direto, sem passar
// por UTC, igual ao fix já aplicado no formatDate.js do front.
function dataLocalDoISO(valor) {
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }
  return new Date(valor);
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

// Mesma resolução de período que resumoFinanceiro sempre usou --
// agora reaproveitada pelos outros 3 módulos também, pra todos
// respeitarem o período escolhido (antes só Financeiro respeitava).
function resolverPeriodo({ inicio, fim } = {}) {
  const agora = new Date();
  const periodoInicio = inicio ? inicioDoDia(dataLocalDoISO(inicio)) : inicioMes(agora);
  const periodoFim = fim ? new Date(dataLocalDoISO(fim).setHours(23, 59, 59, 999)) : fimMes(agora);
  return { periodoInicio, periodoFim };
}

const resumoFinanceiro = async (usuario, { inicio, fim } = {}) => {

  const agora = new Date();
  const { periodoInicio, periodoFim } = resolverPeriodo({ inicio, fim });

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
    pendentesNoPeriodo,
    vencidasNoPeriodo,
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

    // "Como foi aquele mês" -- das cobranças com vencimento dentro do
    // período, quantas ainda estão em aberto (aguardando, dentro do
    // prazo) hoje.
    prisma.receita.aggregate({
      where: { ...escopo, status: "PENDENTE", vencimento: { gte: periodoInicio, lte: periodoFim } },
      _sum: { valor: true },
      _count: true,
    }),

    // Das cobranças com vencimento dentro do período, quantas estão
    // "Atrasada" hoje -- mesma definição de vencida usada no resto do
    // sistema, só filtrada pelas que eram daquele mês.
    prisma.receita.aggregate({
      where: { ...escopo, status: "ATRASADA", vencimento: { gte: periodoInicio, lte: periodoFim } },
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

      {
        chave: "pendentes_periodo",
        rotulo: "Em aberto no período",
        valor: pendentesNoPeriodo._sum.valor || 0,
        formato: "moeda",
        quantidade: pendentesNoPeriodo._count,
        escopo: "periodo",
        criterio: `Das cobranças com vencimento entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}, quantas ainda estão "Pendente" (aguardando pagamento, sem estar vencidas) neste momento.`,
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "PENDENTE", de: dataISO(periodoInicio), ate: dataISO(periodoFim) },
        },
      },

      {
        chave: "vencidas_periodo",
        rotulo: "Vencidas no período",
        valor: vencidasNoPeriodo._sum.valor || 0,
        formato: "moeda",
        quantidade: vencidasNoPeriodo._count,
        escopo: "periodo",
        criterio: `Das cobranças com vencimento entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}, quantas estão "Atrasada" neste momento -- mostra como foi a inadimplência daquele mês especificamente.`,
        navegacao: {
          href: "/financeiro",
          query: { aba: "receitas", status: "ATRASADA", de: dataISO(periodoInicio), ate: dataISO(periodoFim) },
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

// Diferente de Financeiro/Contratos/Solicitações-Vistorias: este
// módulo NÃO respeita o período escolhido, de propósito -- tentei
// reconstruir "ocupação no período" pela data de fim do contrato do
// inquilino e descobri que esse campo não é atualizado quando o
// contrato é renovado informalmente (111 inquilinos ativos, só 43
// com data de fim ainda "válida"). Calcular por ali daria um número
// MENOR que a realidade -- dado errado também, só que pro outro lado.
// Kitnet.status é o campo que a equipe realmente mantém atualizado,
// então fica como a única fonte confiável -- mas só pro AGORA.
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
        criterio: "Total de residências (Unidades) cadastradas no sistema, neste momento -- este módulo não muda com o período (ver nota acima).",
        navegacao: { href: "/unidades", query: {} },
      },

      {
        chave: "kitnets_total",
        rotulo: "Kitnets cadastradas",
        valor: totalKitnets,
        formato: "numero",
        quantidade: totalKitnets,
        escopo: "atual",
        criterio: "Total de kitnets cadastradas, de todas as residências, neste momento.",
        navegacao: { href: "/kitnets", query: {} },
      },

      {
        chave: "kitnets_ocupadas",
        rotulo: "Kitnets ocupadas",
        valor: kitnetsOcupadas,
        formato: "numero",
        quantidade: kitnetsOcupadas,
        escopo: "atual",
        criterio: "Kitnets com status \"Ocupada\" neste momento -- mesma definição que a tela de Kitnets já usa. Não é reconstruível pra um período passado: a data de fim de contrato do inquilino não é mantida em dia quando o contrato é renovado, então calcular por ali subestimaria a ocupação real.",
        navegacao: { href: "/kitnets", query: { status: "OCUPADA" } },
      },

      {
        chave: "kitnets_vazias",
        rotulo: "Kitnets disponíveis",
        valor: kitnetsVazias,
        formato: "numero",
        quantidade: kitnetsVazias,
        escopo: "atual",
        criterio: "Kitnets com status \"Disponível\" neste momento -- prontas pra locação, mesma definição do alerta de \"kitnet vazia\".",
        navegacao: { href: "/kitnets", query: { status: "DISPONIVEL" } },
      },

      {
        chave: "taxa_ocupacao",
        rotulo: "Taxa de ocupação",
        valor: percentualOcupacao,
        formato: "percentual",
        quantidade: totalKitnets,
        escopo: "atual",
        criterio: "Kitnets ocupadas dividido pelo total de kitnets, em porcentagem, neste momento.",
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

// Voltou a ser "situação atual" (não respeita o período de Financeiro)
// -- tentamos reconstruir pelas datas do contrato, funcionava, mas o
// pedido final foi manter o período só dentro do Financeiro e todo o
// resto do Insights como retrato de agora, mais simples de entender.
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

// Também voltou a ser "situação atual" -- mesmo motivo do Contratos
// acima: período fica só no Financeiro.
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
