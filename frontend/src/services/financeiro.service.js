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

  excluir(id) {
    return api(`/receitas/${id}`, {
      method: "DELETE",
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