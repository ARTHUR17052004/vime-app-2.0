import { api } from "./api";

export const WhatsAppService = {
  status() {
    return api("/whatsapp/status");
  },

  mensagens() {
    return api("/whatsapp/mensagens");
  },
};