import { api } from "./api";

export const WhatsappService = {

  async status() {
    return await api("/whatsapp/status");
  },

  async configuracao() {
    return await api("/whatsapp/configuracao");
  },

  async conversas() {
    return await api("/whatsapp/conversas");
  },

  async marcarConversaLida(id) {
    return await api(`/whatsapp/conversas/${id}/lida`, { method: "PUT" });
  },

  async relatorio(filtros = {}) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor) params.set(chave, valor);
    });
    const query = params.toString();
    return await api(`/whatsapp/relatorio${query ? `?${query}` : ""}`);
  },

  async salvarConfiguracao(dados) {
    return await api("/whatsapp/configuracao", {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async conectar() {
    return await api("/whatsapp/conectar", {
      method: "POST",
    });
  },

  async gerarQrCode() {
    return await api("/whatsapp/qrcode", {
      method: "POST",
    });
  },

  async sincronizar() {
    return await api("/whatsapp/sincronizar", {
      method: "POST",
    });
  },

  async enviar(dados) {
    return await api("/whatsapp/enviar", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async webhook(dados) {
    return await api("/whatsapp/webhook", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async receber(dados) {
    return await api("/whatsapp/receber", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async excluirConversa(id) {
    return await api(`/whatsapp/conversas/${id}`, {
      method: "DELETE",
    });
  },

  async excluirMensagem(id) {
    return await api(`/whatsapp/mensagens/${id}`, {
      method: "DELETE",
    });
  },

  async editarMensagem(id, texto) {
    return await api(`/whatsapp/mensagens/${id}`, {
      method: "PUT",
      body: JSON.stringify({ texto }),
    });
  },

};