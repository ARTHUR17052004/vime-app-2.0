import { api } from "./api";

export const PerfilService = {

  listar() {

    return api("/perfis");

  },

  buscar(id) {

    return api(`/perfis/${id}`);

  },

  criar(dados) {

    return api("/perfis", {

      method: "POST",

      body: JSON.stringify(dados),

    });

  },

  atualizar(id, dados) {

    return api(`/perfis/${id}`, {

      method: "PUT",

      body: JSON.stringify(dados),

    });

  },

  excluir(id) {

    return api(`/perfis/${id}`, {

      method: "DELETE",

    });

  },

};