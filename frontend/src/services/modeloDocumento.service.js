import { api } from "./api";

export const ModeloDocumentoService = {

  listar() {
    return api("/modelos-documento");
  },

  buscar(tipo) {
    return api(`/modelos-documento/${tipo}`);
  },

  salvar(tipo, dados) {
    return api(`/modelos-documento/${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

};
