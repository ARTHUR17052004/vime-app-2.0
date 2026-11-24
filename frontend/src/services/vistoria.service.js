import { api } from "./api";
import { API_URL } from "../config/api";

export const VistoriaService = {

  // Endereço de UMA foto/vídeo só (não o array inteiro embutido no
  // JSON) -- ver vistoriaService.obterMidiaVistoria/obterMidiaMissao no
  // backend pro motivo. Precisa de Authorization (não dá pra usar
  // direto num <img src>/<video src>), por isso MidiaRemota.jsx busca
  // isso com fetch() + token, nunca a URL crua na tela.
  midiaUrl(vistoriaId, campo, indice) {
    return `${API_URL}/vistorias/${vistoriaId}/midia/${campo}/${indice}`;
  },

  midiaMissaoUrl(vistoriaId, missaoId, indice) {
    return `${API_URL}/vistorias/${vistoriaId}/missoes/${missaoId}/midia/${indice}`;
  },

  listar() {
    return api("/vistorias");
  },

  buscar(id) {
    return api(`/vistorias/${id}`);
  },

  criar(dados) {
    return api("/vistorias", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar(id, dados) {
    return api(`/vistorias/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir(id) {
    return api(`/vistorias/${id}`, {
      method: "DELETE",
    });
  },

  listarMissoes(id) {
    return api(`/vistorias/${id}/missoes`);
  },

  concluirMissoes(id, dados) {
    return api(`/vistorias/${id}/missoes/concluir`, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  listarArquivoMissoes() {
    return api("/vistorias/arquivo-missoes");
  },

  contarFotosConclusao() {
    return api("/vistorias/arquivo-contagem-fotos");
  },

  buscarMissao(vistoriaId, missaoId) {
    return api(`/vistorias/${vistoriaId}/missoes/${missaoId}`);
  },

  atualizarMissao(vistoriaId, missaoId, dados) {
    return api(`/vistorias/${vistoriaId}/missoes/${missaoId}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluirMissao(vistoriaId, missaoId) {
    return api(`/vistorias/${vistoriaId}/missoes/${missaoId}`, {
      method: "DELETE",
    });
  },

  cancelarRealizacao(vistoriaId) {
    return api(`/vistorias/${vistoriaId}/cancelar-realizacao`, {
      method: "POST",
    });
  },

};
