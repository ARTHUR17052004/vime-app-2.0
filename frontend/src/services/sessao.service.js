import { api } from "./api";

export const SessaoService = {

  listar() {

    return api("/sessoes");

  },

};
