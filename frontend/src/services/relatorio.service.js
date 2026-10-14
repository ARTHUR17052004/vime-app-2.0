import { api } from "./api";

export const RelatorioService = {

  listarConfig() {
    return api("/relatorios/config");
  },

  atualizarConfig(tipo, dados) {
    return api(`/relatorios/config/${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

};
