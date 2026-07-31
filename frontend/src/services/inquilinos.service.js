import { api } from "./api";

export const InquilinoService = {

  listar() {
    return api("/inquilinos");
  },

  buscar(id) {
    return api(`/inquilinos/${id}`);
  },

  criar(dados) {
    return api("/inquilinos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/inquilinos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/inquilinos/${id}`, {
      method: "DELETE",
    });
  },

};