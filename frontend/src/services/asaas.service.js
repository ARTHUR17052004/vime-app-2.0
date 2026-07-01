import { api } from "./api";

export const AsaasService = {
  status() {
    return api("/asaas/status");
  },

  configuracao() {
    return api("/asaas/config");
  },

  transacoes() {
    return api("/asaas/transacoes");
  },
};