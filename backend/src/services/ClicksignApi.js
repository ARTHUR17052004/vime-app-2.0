const axios = require("axios");

const prisma = require("../config/prisma");

const USAR_MOCK =
  process.env.CLICKSIGN_MOCK === "true";

const BASE_URLS = {
  sandbox: "https://sandbox.clicksign.com/api/v1",
  producao: "https://app.clicksign.com/api/v1",
};

class ClicksignApi {

  async obterConfig() {

    const configuracao = await prisma.configuracao.findFirst({
      orderBy: { id: "asc" },
    });

    const apiKey =
      configuracao?.clicksignToken ||
      process.env.CLICKSIGN_API_KEY ||
      "";

    const ambiente =
      configuracao?.clicksignAmbiente ||
      process.env.CLICKSIGN_ENV ||
      "sandbox";

    const baseURL =
      process.env.CLICKSIGN_API_URL ||
      BASE_URLS[ambiente] ||
      BASE_URLS.sandbox;

    return {
      apiKey,
      ambiente,
      baseURL,
      configuracaoId: configuracao?.id || null,
    };

  }

  async request(method, endpoint, body = null) {

    const { apiKey, baseURL } = await this.obterConfig();

    if (USAR_MOCK || !apiKey) {

      return {
        success: true,
        mock: true,
        method,
        endpoint,
        body
      };

    }

    try {

      const separador = endpoint.includes("?") ? "&" : "?";

      const response = await axios({

        method,

        // API v1 da Clicksign autentica via query string "access_token",
        // não via header Authorization.
        url: `${baseURL}${endpoint}${separador}access_token=${apiKey}`,

        headers: {

          "Content-Type": "application/json"

        },

        data: body

      });

      return response.data;

    } catch (error) {

      console.error("Erro Clicksign:");

      if (error.response) {

        console.error(error.response.data);

        throw new Error(
          error.response.data.message ||
          "Erro ao comunicar com a Clicksign."
        );

      }

      throw new Error(
        error.message || "Erro desconhecido na Clicksign."
      );

    }

  }

  async criarDocumento(documento) {

    return this.request(
      "POST",
      "/documents",
      documento
    );

  }

  async listarDocumentos() {

    return this.request(
      "GET",
      "/documents"
    );

  }

  async buscarDocumento(id) {

    return this.request(
      "GET",
      `/documents/${id}`
    );

  }

  async atualizarDocumento(id, documento) {

    return this.request(
      "PUT",
      `/documents/${id}`,
      documento
    );

  }

  async cancelarDocumento(id) {

    return this.request(
      "DELETE",
      `/documents/${id}`
    );

  }

  // Fluxo real da API v1 da Clicksign para colocar um documento para
  // assinar: 1) criar o signatário (retorna um "key" próprio dele),
  // 2) vincular esse signatário ao documento através de uma "lista".
  async criarSignatario(signatario) {

    return this.request(
      "POST",
      "/signers",
      { signer: signatario }
    );

  }

  async criarLista(documentKey, signerKey, opcoes = {}) {

    return this.request(
      "POST",
      "/lists",
      {
        list: {
          document_key: documentKey,
          signer_key: signerKey,
          sign_as: opcoes.signAs || "sign",
          message: opcoes.message
        }
      }
    );

  }

  async receberWebhook(dados) {

    console.log("Webhook Clicksign:");

    console.log(dados);

    return {
      success: true,
      recebido: true,
      dados
    };

  }

}

module.exports = new ClicksignApi();
