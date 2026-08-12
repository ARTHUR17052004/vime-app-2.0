import { api } from "./api";

export const LogService = {

  listar() {

    return api("/logs");

  },

};
