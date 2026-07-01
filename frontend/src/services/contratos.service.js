import { api } from "./api";

export const ContratoService = {
  listar() {
    return api("/contratos");
  },

  buscar(id) {
    return api(`/contratos/${id}`);
  },

  criar(body) {
    return api("/contratos", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  atualizar(id, body) {
    return api(`/contratos/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  excluir(id) {
    return api(`/contratos/${id}`, {
      method: "DELETE",
    });
  },
};