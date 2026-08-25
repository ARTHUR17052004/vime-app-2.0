import { api } from "./api";

export const SignatarioFixoService = {

  listar() {
    return api("/signatarios-fixos");
  },

  criar(dados) {
    return api("/signatarios-fixos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/signatarios-fixos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/signatarios-fixos/${id}`, { method: "DELETE" });
  },

};
