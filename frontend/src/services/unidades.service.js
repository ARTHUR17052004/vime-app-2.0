import { api } from "./api";

export const UnidadeService = {
  async listar() {
    return await api("/unidades");
  },

  async criar(dados) {
    return await api("/unidades", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async atualizar(id, dados) {
    return await api(`/unidades/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async excluir(id) {
    return await api(`/unidades/${id}`, {
      method: "DELETE",
    });
  },
};