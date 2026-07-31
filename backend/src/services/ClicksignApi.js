const axios = require("axios");

const USAR_MOCK =
  process.env.CLICKSIGN_MOCK === "true";

class ClicksignApi {

  constructor() {

    this.baseURL =
      process.env.CLICKSIGN_API_URL ||
      "https://sandbox.clicksign.com/api/v1";

    this.apiKey =
      process.env.CLICKSIGN_API_KEY || "";

  }

async request(method, endpoint, body = null) {

  if (USAR_MOCK || !this.apiKey) {

    return {
      success: true,
      mock: true,
      method,
      endpoint,
      body
    };

  }

  try {

    const response = await axios({

      method,

      url: `${this.baseURL}${endpoint}`,

      headers: {

        Authorization: this.apiKey,

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

  async enviarAssinatura(id, assinatura) {

    return this.request(
      "POST",
      `/documents/${id}/sign`,
      assinatura
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