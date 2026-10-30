import { api } from "./api";

export const AsaasService = {

  config() {
    return api("/asaas/config");
  },

  status() {
    return api("/asaas/status");
  },

  testarConexao() {
    return api("/asaas/testar-conexao", { method: "POST" });
  },

  buscarWallet() {
    return api("/asaas/buscar-wallet", { method: "POST" });
  },

  gerarTokenWebhook() {
    return api("/asaas/webhook/token", { method: "POST" });
  },

  testarWebhook() {
    return api("/asaas/webhook/testar", { method: "POST" });
  },

  resumo() {
    return api("/asaas/resumo");
  },

  listarTransacoes() {
    return api("/asaas/transacoes");
  },

  buscarTransacao(id) {
    return api(`/asaas/transacoes/${id}`);
  },

  enviarCobranca(receitaId) {
    return api(`/asaas/transacoes/${receitaId}/enviar`, { method: "POST" });
  },

};
