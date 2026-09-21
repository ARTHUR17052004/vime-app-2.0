import { api } from "./api";

export const NotificacaoService = {
  listarNaoLidas() {
    return api("/notificacoes/nao-lidas");
  },

  listarHistorico() {
    return api("/notificacoes/historico");
  },

  marcarComoLida(id) {
    return api(`/notificacoes/${id}/ler`, { method: "PUT" });
  },

  listarConfig() {
    return api("/notificacoes/config");
  },

  atualizarConfig(tipo, dados) {
    return api(`/notificacoes/config/${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  marcarTodasComoLidas() {
    return api("/notificacoes/ler-todas", { method: "PUT" });
  },
};