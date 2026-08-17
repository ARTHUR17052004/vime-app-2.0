import { api } from "./api";

export const ConfiguracaoService = {

  listar() {

    return api("/configuracoes");

  },

  buscarPublica() {

    return api("/configuracoes/publica");

  },

  criar(dados) {

    return api("/configuracoes", {

      method: "POST",

      body: JSON.stringify(dados),

    });

  },

  atualizar(id, dados) {

    return api(`/configuracoes/${id}`, {

      method: "PUT",

      body: JSON.stringify(dados),

    });

  },

};
