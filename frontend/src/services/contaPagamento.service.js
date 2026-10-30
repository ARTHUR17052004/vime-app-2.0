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

  extratoPix(id, mes) {
    const query = mes ? `?mes=${mes}` : "";
    return api(`/contas-pagamento/${id}/extrato-pix${query}`);
  },

  // Só se aplica a contas do provider ASAAS.
  testarConexao(id) {
    return api(`/contas-pagamento/${id}/testar-conexao`, { method: "POST" });
  },

  registrarWebhook(id) {
    return api(`/contas-pagamento/${id}/registrar-webhook`, { method: "POST" });
  },

};
