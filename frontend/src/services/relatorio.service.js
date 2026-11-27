import { api } from "./api";
import { API_URL } from "../config/api";
import { Sessao } from "../utils/sessao";

export const RelatorioService = {

  listarConfig() {
    return api("/relatorios/config");
  },

  atualizarConfig(tipo, dados) {
    return api(`/relatorios/config/${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  listarAgendados() {
    return api("/relatorios/agendados");
  },

  agendar(dados) {
    return api("/relatorios/agendados", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  cancelarAgendado(id) {
    return api(`/relatorios/agendados/${id}`, {
      method: "DELETE",
    });
  },

  async baixarAgendado(id) {
    const token =
      typeof window !== "undefined"
        ? Sessao.token()
        : null;

    const response = await fetch(`${API_URL}/relatorios/agendados/${id}/arquivo`, {
      credentials: "include",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      let mensagem = "Erro ao baixar o relatório.";
      try {
        const corpo = await response.json();
        mensagem = corpo.message || mensagem;
      } catch {}
      throw new Error(mensagem);
    }

    return response.blob();
  },

};
