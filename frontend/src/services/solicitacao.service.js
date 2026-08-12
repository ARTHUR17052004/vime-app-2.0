import { api } from "./api";

export const SolicitacaoService = {

  listar() {
    return api("/solicitacoes");
  },

  buscar(id) {
    return api(`/solicitacoes/${id}`);
  },

  criar(dados) {
    return api("/solicitacoes", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/solicitacoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/solicitacoes/${id}`, {
      method: "DELETE",
    });
  },

  listarMensagens(id) {
    return api(`/solicitacoes/${id}/mensagens`);
  },

  enviarMensagem(id, dados) {
    return api(`/solicitacoes/${id}/mensagens`, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

};
