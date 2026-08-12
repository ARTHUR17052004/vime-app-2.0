const axios = require("axios");
const prisma = require("../config/prisma");

class MetaWhatsappService {

  async obterCredenciais() {

    const configuracao =
      await prisma.configuracaoWhatsapp.findFirst();

    return {
      phoneId:
        configuracao?.phoneNumberId ||
        process.env.WHATSAPP_PHONE_NUMBER_ID,

      token:
        configuracao?.token ||
        process.env.WHATSAPP_ACCESS_TOKEN,
    };

  }

  async temCredenciais() {

    const { phoneId, token } = await this.obterCredenciais();

    return Boolean(phoneId && token);

  }

  async request(endpoint, body) {

    const { phoneId, token } = await this.obterCredenciais();

    if (!phoneId || !token) {
      throw new Error(
        "WhatsApp não configurado: informe o Token e o Phone Number ID na tela de Configuração."
      );
    }

    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v23.0/${phoneId}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: body,
    });

    return response.data;

  }

  async enviarMensagem(numero, mensagem) {

    return await this.request(

      "/messages",

      {

        messaging_product: "whatsapp",

        to: numero.replace(/\D/g, ""),

        type: "text",

        text: {

          body: mensagem,

        },

      }

    );

  }

  async webhook(dados) {

    console.log("Webhook Meta:");

    console.dir(dados, {

      depth: null,

    });

    return {

      success: true,

    };

  }

}

module.exports = new MetaWhatsappService();
