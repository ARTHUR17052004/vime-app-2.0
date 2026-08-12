import { api } from "./api";

export const VistoriaService = {

  listar() {
    return api("/vistorias");
  },

  buscar(id) {
    return api(`/vistorias/${id}`);
  },

  criar(dados) {
    return api("/vistorias", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/vistorias/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/vistorias/${id}`, {
      method: "DELETE",
    });
  },

};
