import { api } from "./api";

export const FeriadoService = {

  listar(ano) {

    return api(`/feriados?ano=${ano}`);

  },

  criar(dados) {

    return api("/feriados", {

      method: "POST",

      body: JSON.stringify(dados),

    });

  },

  excluir(id) {

    return api(`/feriados/${id}`, {

      method: "DELETE",

    });

  },

};
