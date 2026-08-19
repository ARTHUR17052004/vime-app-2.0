import { api } from "./api";
import { API_URL } from "../config/api";

export const ClicksignService = {

  async baixarArquivo(id) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const response = await fetch(`${API_URL}/clicksign/documentos/${id}/baixar`, {
      credentials: "include",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      let mensagem = "Erro ao baixar o documento da Clicksign.";
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

  config() {
    return api("/clicksign/config");
  },

  status() {
    return api("/clicksign/status");
  },

  testarConexao() {
    return api("/clicksign/testar-conexao", { method: "POST" });
  },

  sincronizar() {
    return api("/clicksign/sincronizar", { method: "POST" });
  },

  enviarDocumento(dados) {
    return api("/clicksign/enviar", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  listarDocumentos() {
    return api("/clicksign/documentos");
  },

  criarDocumento(dados) {
    return api("/clicksign/documentos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  buscarDocumento(id) {
    return api(`/clicksign/documentos/${id}`);
  },

  cancelarDocumento(id) {
    return api(`/clicksign/documentos/${id}`, { method: "DELETE" });
  },

  enviarAssinatura(id, dados) {
    return api(`/clicksign/documentos/${id}/assinar`, {
      method: "POST",
      body: JSON.stringify(dados || {}),
    });
  },

};
