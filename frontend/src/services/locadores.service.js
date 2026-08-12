import { api } from "./api";

export const LocadorService = {

  listar() {
    return api("/locadores");
  },

  buscar(id) {
    return api(`/locadores/${id}`);
  },

  criar(dados) {
    return api("/locadores", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/locadores/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/locadores/${id}`, {
      method: "DELETE",
    });
  },

};