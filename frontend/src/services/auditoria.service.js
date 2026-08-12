import { api } from "./api";

export const AuditoriaService = {

  listar() {

    return api("/auditoria");

  },

};
