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

  marcarTodasComoLidas() {
    return api("/notificacoes/ler-todas", { method: "PUT" });
  },
};