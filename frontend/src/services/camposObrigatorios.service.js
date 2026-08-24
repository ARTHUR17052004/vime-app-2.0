import { api } from "./api";

export const CamposObrigatoriosService = {
  async listar(modulo) {
    return await api(`/campos-obrigatorios/${modulo}`);
  },

  async salvar(modulo, campos) {
    return await api(`/campos-obrigatorios/${modulo}`, {
      method: "PUT",
      body: JSON.stringify({ campos }),
    });
  },
};
