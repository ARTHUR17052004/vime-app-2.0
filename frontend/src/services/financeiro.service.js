import { api } from "./api";

export const FinanceiroService = {
  resumo() {
    return api("/financeiro/resumo");
  },

  fluxoCaixa() {
    return api("/financeiro/fluxo-caixa");
  },

  receitas() {
    return api("/receitas");
  },

  despesas() {
    return api("/despesas");
  },
};

export const ReceitaService = {

  listar() {
    return api("/receitas");
  },

  historico(id) {
    return api(`/receitas/${id}/historico`);
  },

  taxaBoleto({ inquilinoId, contratoId } = {}) {

    const params = new URLSearchParams();
    if (inquilinoId) params.set("inquilinoId", inquilinoId);
    if (contratoId) params.set("contratoId", contratoId);

    const query = params.toString();

    return api(`/receitas/taxa-boleto${query ? `?${query}` : ""}`);

  },

  criar(dados) {
    return api("/receitas", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/receitas/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id, dados) {
    return api(`/receitas/${id}`, {
      method: "DELETE",
      body: dados ? JSON.stringify(dados) : undefined,
    });
  },

  classificarInadimplencia(id, dados) {
    return api(`/receitas/${id}/classificar-inadimplencia`, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

};

export const DespesaService = {

  listar() {
    return api("/despesas");
  },

  criar(dados) {
    return api("/despesas", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/despesas/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/despesas/${id}`, {
      method: "DELETE",
    });
  },

};