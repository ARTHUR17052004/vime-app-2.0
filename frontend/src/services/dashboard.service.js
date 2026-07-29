import { api } from "./api";

export const DashboardService = {
  async listar() {

    const resultado = {};

    try {
      resultado.dashboard = await api("/dashboard");
      console.log("✓ dashboard");
    } catch (e) {
      console.error("/dashboard", e);
    }

    try {
      resultado.financeiro = await api("/dashboard/financeiro");
      console.log("✓ financeiro");
    } catch (e) {
      console.error("/dashboard/financeiro", e);
    }

    try {
      resultado.ocupacao = await api("/dashboard/ocupacao");
      console.log("✓ ocupacao");
    } catch (e) {
      console.error("/dashboard/ocupacao", e);
    }

    try {
      resultado.atividades = await api("/dashboard/atividades");
      console.log("✓ atividades");
    } catch (e) {
      console.error("/dashboard/atividades", e);
    }

    try {
      resultado.alertas = await api("/dashboard/alertas");
      console.log("✓ alertas");
    } catch (e) {
      console.error("/dashboard/alertas", e);
    }

    return {
      ...resultado.dashboard,
      financeiro: resultado.financeiro,
      ocupacao: resultado.ocupacao,
      atividades: resultado.atividades,
      alertas: resultado.alertas,
    };
  },
};