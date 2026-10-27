const prisma = require("../config/prisma");
const { filtroReceita, filtroKitnet, filtroUnidade, filtroContrato, filtroSolicitacao, filtroVistoria } = require("../utils/escopoLocador");
const campoObrigatorioService = require("./campoObrigatorioService");

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

const resumoContratos = async (usuario, { inicio, fim } = {}) => {

  const { periodoInicio, periodoFim } = resolverPeriodo({ inicio, fim });

  const escopo = filtroContrato(usuario);

  const [vigentes, terminoNoPeriodo, criadosNoPeriodo, encerradosTotal] = await Promise.all([

    // Vigência reconstruída pelas DATAS do contrato (início/fim), não
    // pelo status atual -- um contrato hoje "Encerrado" ainda conta
    // como vigente num período passado em que ele esteve ativo de
    // verdade. "Pendente" nunca chegou a vigorar, por isso fica fora.
    prisma.contrato.count({
      where: {
        ...escopo,
        status: { not: "PENDENTE" },
        dataInicio: { lte: periodoFim },
        OR: [{ dataFim: null }, { dataFim: { gte: periodoInicio } }],
      },
    }),

    prisma.contrato.count({
      where: { ...escopo, dataFim: { not: null, gte: periodoInicio, lte: periodoFim } },
    }),

    // Todo contrato nasce "Pendente" (aguardando assinatura) -- contar
    // os criados no período é o jeito honesto de saber quantos
    // "entraram pendentes" naquele mês, sem depender do status atual
    // (que pode já ter virado Ativo ou Encerrado desde então).
    prisma.contrato.count({
      where: { ...escopo, createdAt: { gte: periodoInicio, lte: periodoFim } },
    }),

    // Acumulado, não só do período -- "quantos contratos já se
    // encerraram até esse momento da história".
    prisma.contrato.count({
      where: { ...escopo, status: "ENCERRADO", dataFim: { not: null, lte: periodoFim } },
    }),

  ]);

  return {

    periodo: { inicio: dataISO(periodoInicio), fim: dataISO(periodoFim) },
    geradoEm: new Date().toISOString(),

    indicadores: [

      {
        chave: "contratos_vigentes",
        rotulo: "Contratos vigentes no período",
        valor: vigentes,
        formato: "numero",
        quantidade: vigentes,
        escopo: "periodo",
        criterio: `Contratos (exceto "Pendente") cuja vigência se sobrepõe a ${dataISO(periodoInicio)} - ${dataISO(periodoFim)} -- calculado pelas datas de início/fim do contrato, não pelo status atual, pra valer também em períodos passados.`,
        navegacao: { href: "/contratos", query: { status: "ATIVO" } },
      },

      {
        chave: "contratos_vencendo",
        rotulo: "Com término no período",
        valor: terminoNoPeriodo,
        formato: "numero",
        quantidade: terminoNoPeriodo,
        escopo: "periodo",
        criterio: `Contratos cuja data de fim caiu entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}.`,
        navegacao: { href: "/contratos", query: {} },
      },

      {
        chave: "contratos_pendentes",
        rotulo: "Criados no período",
        valor: criadosNoPeriodo,
        formato: "numero",
        quantidade: criadosNoPeriodo,
        escopo: "periodo",
        criterio: `Contratos cadastrados no sistema entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)} -- todo contrato novo começa como "Pendente", aguardando assinatura.`,
        navegacao: { href: "/contratos", query: {} },
      },

      {
        chave: "contratos_encerrados",
        rotulo: "Total já encerrados",
        valor: encerradosTotal,
        formato: "numero",
        quantidade: encerradosTotal,
        escopo: "periodo",
        criterio: `Contratos com status "Encerrado" e data de fim até ${dataISO(periodoFim)} -- acumulado histórico, não só os encerrados dentro do período.`,
        navegacao: { href: "/contratos", query: { status: "ENCERRADO" } },
      },

    ],

  };

};

const resumoSolicitacoesVistorias = async (usuario, { inicio, fim } = {}) => {

  const { periodoInicio, periodoFim } = resolverPeriodo({ inicio, fim });

  const escopoSolicitacao = filtroSolicitacao(usuario);
  const escopoVistoria = filtroVistoria(usuario);

  // VistoriaMissao (vistorias "Geral", por residência) não tem helper
  // em escopoLocador -- mesmo filtro por locador, mas via a unidade da
  // missão, não da vistoria-mãe (essa não tem unidadeId quando é Geral).
  const escopoMissao = usuario?.locadorId ? { unidade: { locadorId: usuario.locadorId } } : {};

  const [
    solicitacoesNoPeriodo,
    prazosNoPeriodo,
    vistoriasConcluidasUma,
    missoesConcluidas,
    ocorrenciasNoPeriodo,
  ] = await Promise.all([

    prisma.solicitacao.count({
      where: { ...escopoSolicitacao, createdAt: { gte: periodoInicio, lte: periodoFim } },
    }),

    prisma.solicitacao.count({
      where: { ...escopoSolicitacao, prazo: { not: null, gte: periodoInicio, lte: periodoFim } },
    }),

    // Vistoria "normal" (de uma residência só) conclui mudando o
    // status pra REALIZADA e carimbando concluidaEm -- mas a "Geral"
    // (várias residências, um ciclo por vez) NUNCA vira REALIZADA; o
    // que ela conclui fica em VistoriaMissao, por residência (mesma
    // lição do bug corrigido no contador "Realizadas" de Vistorias).
    // Somar os dois é o único jeito de não subcontar.
    prisma.vistoria.count({
      where: { ...escopoVistoria, status: "REALIZADA", concluidaEm: { gte: periodoInicio, lte: periodoFim } },
    }),

    prisma.vistoriaMissao.count({
      where: { ...escopoMissao, dataRealizacao: { gte: periodoInicio, lte: periodoFim } },
    }),

    prisma.ocorrencia.count({
      where: { vistoria: escopoVistoria, createdAt: { gte: periodoInicio, lte: periodoFim } },
    }),

  ]);

  const vistoriasConcluidas = vistoriasConcluidasUma + missoesConcluidas;

  return {

    periodo: { inicio: dataISO(periodoInicio), fim: dataISO(periodoFim) },
    geradoEm: new Date().toISOString(),

    indicadores: [

      {
        chave: "solicitacoes_abertas",
        rotulo: "Solicitações abertas no período",
        valor: solicitacoesNoPeriodo,
        formato: "numero",
        quantidade: solicitacoesNoPeriodo,
        escopo: "periodo",
        criterio: `Solicitações criadas entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)} -- não dá pra reconstruir se cada uma "ainda estava aberta" num dia específico do passado (o sistema não guarda histórico de status), então conta quantas entraram naquele período.`,
        navegacao: { href: "/solicitacoes", query: {} },
      },

      {
        chave: "solicitacoes_atrasadas",
        rotulo: "Prazos no período",
        valor: prazosNoPeriodo,
        formato: "numero",
        quantidade: prazosNoPeriodo,
        escopo: "periodo",
        criterio: `Solicitações cujo prazo caiu entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}, independente do status atual.`,
        navegacao: { href: "/solicitacoes", query: {} },
      },

      {
        chave: "vistorias_concluidas",
        rotulo: "Vistorias concluídas no período",
        valor: vistoriasConcluidas,
        formato: "numero",
        quantidade: vistoriasConcluidas,
        escopo: "periodo",
        criterio: `Vistorias normais concluídas (${vistoriasConcluidasUma}) + residências vistoriadas em ciclos de vistoria "Geral" (${missoesConcluidas}) entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}. Status como "Atrasada"/"Pendente" não tem histórico guardado, por isso o foco aqui é o que foi efetivamente realizado no período.`,
        navegacao: { href: "/vistorias", query: {} },
      },

      {
        chave: "ocorrencias_registradas",
        rotulo: "Ocorrências registradas no período",
        valor: ocorrenciasNoPeriodo,
        formato: "numero",
        quantidade: ocorrenciasNoPeriodo,
        escopo: "periodo",
        criterio: `Ocorrências (problemas/achados) anotadas em vistorias entre ${dataISO(periodoInicio)} e ${dataISO(periodoFim)}.`,
        navegacao: { href: "/vistorias", query: {} },
      },

    ],

  };

};

module.exports = { resumoFinanceiro, resumoImoveis, resumoContratos, resumoSolicitacoesVistorias };
