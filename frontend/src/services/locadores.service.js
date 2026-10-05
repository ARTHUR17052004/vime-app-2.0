import { api } from "./api";

export const LocadorService = {

  listar() {
    return api("/locadores");
  },

  // Só id+nome, de todos -- pro seletor de "locador de trabalho" (ver
  // utils/locadorFiltro.js), sem precisar de "locadores.visualizar".
  listarOpcoes() {
    return api("/locadores/opcoes");
  },

  buscar(id) {
    return api(`/locadores/${id}`);
  },

  criar(dados) {
    return api("/locadores", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/locadores/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/locadores/${id}`, {
      method: "DELETE",
    });
  },

};