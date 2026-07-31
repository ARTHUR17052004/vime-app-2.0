const axios = require("axios");

const USAR_MOCK =
  process.env.WHATSAPP_MOCK === "true";

class WhatsappService {

  constructor() {

    this.baseURL =
      process.env.WHATSAPP_API_URL || "";

    this.token =
      process.env.WHATSAPP_API_TOKEN || "";

  }

  async request(endpoint, body) {

    if (USAR_MOCK || !this.token) {

      return {
        success: true,
        mock: true,
        endpoint,
        body
      };

    }

    try {

      const response = await axios({

        method: "POST",

        url: `${this.baseURL}${endpoint}`,

        headers: {

          Authorization: `Bearer ${this.token}`,

          "Content-Type": "application/json"

        },

        data: body

      });

      return response.data;

    } catch (error) {

      console.error("Erro WhatsApp:");

      if (error.response) {

        console.error(error.response.data);

        throw new Error(
          error.response.data.error?.message ||
          "Erro ao comunicar com o WhatsApp."
        );

      }

      throw new Error(
        error.message || "Erro desconhecido no WhatsApp."
      );

    }

  }

  async status() {

    return {
      conectado: !!this.token,
      mock: USAR_MOCK
    };

  }

  async enviarMensagem(dados) {

    return this.request(
      "/messages",
      dados
    );

  }

  async receberMensagem(dados) {

    return {
      success: true,
      recebido: dados
    };

  }

  async webhook(dados) {

    console.log("Webhook WhatsApp:");

    console.log(dados);

    if (
      dados?.messages &&
      dados.messages.length > 0
    ) {

      return {
        success: true,
        recebido: true,
        mensagem: dados.messages[0]
      };

    }

    return {
      success: true,
      recebido: true
    };

  }

}

module.exports = new WhatsappService();