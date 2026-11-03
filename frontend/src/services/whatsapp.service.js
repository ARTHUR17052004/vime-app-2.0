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