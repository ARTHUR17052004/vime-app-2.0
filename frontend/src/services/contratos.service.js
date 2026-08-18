import { api } from "./api";
import { API_URL } from "../config/api";

export const ContratoService = {

  async baixarPdf(id) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const response = await fetch(`${API_URL}/contratos/${id}/pdf`, {
      credentials: "include",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      let mensagem = "Erro ao gerar o PDF do contrato.";
      try {
        const data = await response.json();
        mensagem = data.message || mensagem;
      } catch {
        // resposta não era JSON, mantém mensagem padrão
      }
      throw new Error(mensagem);
    }

    return response.blob();
  },
  listar() {
    return api("/contratos");
  },

  buscar(id) {
    return api(`/contratos/${id}`);
  },

  criar(body) {
    return api("/contratos", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  atualizar(id, body) {
    return api(`/contratos/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  excluir(id) {
    return api(`/contratos/${id}`, {
      method: "DELETE",
    });
  },
};