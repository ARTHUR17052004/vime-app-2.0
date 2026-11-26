import { api } from "./api";

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

};
