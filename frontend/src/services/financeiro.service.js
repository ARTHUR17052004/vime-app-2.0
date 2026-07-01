import { api } from "./api";

export const FinanceiroService = {
  resumo() {
    return api("/financeiro/resumo");
  },

  fluxoCaixa() {
    return api("/financeiro/fluxo-caixa");
  },

  receitas() {
    return api("/receitas");
  },

  despesas() {
    return api("/despesas");
  },
};