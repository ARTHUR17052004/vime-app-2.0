import { api } from "./api";

export const ClicksignService = {

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
