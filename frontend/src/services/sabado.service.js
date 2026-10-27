import { api } from "./api";

export const SabadoService = {

  resumoExecutivo({ inicio, fim } = {}) {

    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);

    const query = params.toString();

    return api(`/sabado/resumo-executivo${query ? `?${query}` : ""}`);

  },

  chat(mensagens) {

    return api("/sabado/chat", {
      method: "POST",
      body: JSON.stringify({ mensagens }),
    });

  },

};
