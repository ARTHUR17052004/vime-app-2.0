import { api } from "./api";

export const DashboardService = {
  async listar() {

    const [
      dashboard,
      financeiro,
      ocupacao,
      atividades,
      alertas,
    ] = await Promise.all([

      api("/dashboard"),

      api("/dashboard/financeiro"),

      api("/dashboard/ocupacao"),

      api("/dashboard/atividades"),

      api("/dashboard/alertas"),

    ]);

    return {

      ...dashboard,

      financeiro,

      ocupacao,

      atividades,

      alertas,

    };

  },
};