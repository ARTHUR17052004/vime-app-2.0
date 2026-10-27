import { api } from "./api";

export const SabadoService = {

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
