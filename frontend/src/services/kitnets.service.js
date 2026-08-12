import { api } from "./api";

export const KitnetService = {
  listar() {
    return api("/kitnets");
  },

  buscar(id) {
    return api(`/kitnets/${id}`);
  },

  criar(dados) {
    return api("/kitnets", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/kitnets/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/kitnets/${id}`, {
      method: "DELETE",
    });
  },
};