import { api } from "./api";

export const SabadoService = {

  resumoExecutivo({ inicio, fim } = {}) {

    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);

    const query = params.toString();

    return api(`/sabado/resumo-executivo${query ? `?${query}` : ""}`);

  },

  chat({ conversaId, mensagem }) {

    return api("/sabado/chat", {
      method: "POST",
      body: JSON.stringify({ conversaId, mensagem }),
    });

  },

  listarConversas(busca) {

    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);

    const query = params.toString();

    return api(`/sabado/conversas${query ? `?${query}` : ""}`);

  },

  buscarConversa(id) {

    return api(`/sabado/conversas/${id}`);

  },

  excluirConversa(id) {

    return api(`/sabado/conversas/${id}`, { method: "DELETE" });

  },

};
