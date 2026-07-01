export const dashboardMock = {
  inquilinos: 24,
  locadores: 6,
  unidades: 7,
  kitnets: 38,

  contratosAtivos: 31,
  contratosVencendo: 3,

  inadimplentes: 2,

  receitaMensal: 18540,

  ocupacao: 92,

  solicitacoesPendentes: 4,

  financeiro: {
    recebido: 18540,
    pendente: 4280,
    atrasado: 1350,
    cancelado: 650,
  },

  atividades: [
    {
      id: 1,
      descricao: "João pagou aluguel",
      data: "Hoje",
    },
    {
      id: 2,
      descricao: "Maria assinou contrato",
      data: "Hoje",
    },
    {
      id: 3,
      descricao: "PIX recebido",
      data: "Hoje",
    },
  ],

  alertas: [
    {
      id: 1,
      titulo: "3 contratos vencem amanhã",
      tipo: "warning",
    },
    {
      id: 2,
      titulo: "2 aluguéis atrasados",
      tipo: "danger",
    },
  ],
};