import { api } from "./api";

export const ConfiguracaoFinanceiroService = {

  buscar() {
    return api("/financeiro-config");
  },

  atualizar(dados) {
    return api("/financeiro-config", {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

};
