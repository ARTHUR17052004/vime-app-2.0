import { api } from "./api";

export const ChamadoService = {

  listar() {
    return api("/suporte");
  },

  buscar(id) {
    return api(`/suporte/${id}`);
  },

  criar(dados) {
    return api("/suporte", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/suporte/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/suporte/${id}`, {
      method: "DELETE",
    });
  },

  listarMensagens(id) {
    return api(`/suporte/${id}/mensagens`);
  },

  enviarMensagem(id, dados) {
    return api(`/suporte/${id}/mensagens`, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

};
