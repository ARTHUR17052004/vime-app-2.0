import { api } from "./api";

export const DashboardService = {
  listar() {
    return api("/dashboard");
  },

  atividades() {
    return api("/dashboard/atividades");
  },

  alertas() {
    return api("/dashboard/alertas");
  },

  financeiro() {
    return api("/dashboard/financeiro");
  },
};