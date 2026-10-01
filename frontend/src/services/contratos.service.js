import { api } from "./api";
import { API_URL } from "../config/api";
import { Sessao } from "../utils/sessao";

export const ContratoService = {

  async baixarPdf(id) {
    const token =
      typeof window !== "undefined"
        ? Sessao.token()
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

  enviarClicksign(id, signatariosExtras = []) {
    return api(`/contratos/${id}/enviar-clicksign`, {
      method: "POST",
      body: JSON.stringify({ signatariosExtras }),
    });
  },

  renovar(id) {
    return api(`/contratos/${id}/renovar`, {
      method: "PATCH",
    });
  },

  // Arquivo do "Adicionar Contrato" (PDF/foto do contrato real, diferente
  // do PDF modelo gerado pelo VIME). `arquivo` é um File do input.
  enviarArquivo(id, arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const [, base64] = String(leitor.result).split(",");
        api(`/contratos/${id}/arquivo`, {
          method: "POST",
          body: JSON.stringify({
            dados: base64,
            tipo: arquivo.type,
            nomeOriginal: arquivo.name,
          }),
        }).then(resolve).catch(reject);
      };
      leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
      leitor.readAsDataURL(arquivo);
    });
  },

  async baixarArquivo(id) {
    const token = typeof window !== "undefined" ? Sessao.token() : null;

    const response = await fetch(`${API_URL}/contratos/${id}/arquivo`, {
      credentials: "include",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });

    if (!response.ok) {
      let mensagem = "Erro ao baixar o arquivo do contrato.";
      try {
        const data = await response.json();
        mensagem = data.message || mensagem;
      } catch {}
      throw new Error(mensagem);
    }

    return response.blob();
  },

  removerArquivo(id) {
    return api(`/contratos/${id}/arquivo`, {
      method: "DELETE",
    });
  },
};