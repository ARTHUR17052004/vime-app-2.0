import { api } from "./api";

export const ContaPagamentoService = {

  listar() {
    return api("/contas-pagamento");
  },

  criar(dados) {
    return api("/contas-pagamento", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/contas-pagamento/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/contas-pagamento/${id}`, {
      method: "DELETE",
    });
  },

};
