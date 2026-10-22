import { api } from "./api";

export const InsightsService = {

  financeiro({ inicio, fim } = {}) {

    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);

    const query = params.toString();

    return api(`/insights/financeiro${query ? `?${query}` : ""}`);

  },

  imoveis() {
    return api("/insights/imoveis");
  },

  contratos() {
    return api("/insights/contratos");
  },

};
