const axios = require("axios");

class MetaWhatsappService {

  constructor() {

  console.log("ENV PHONE:", process.env.WHATSAPP_PHONE_NUMBER_ID);
  console.log("ENV TOKEN:", process.env.WHATSAPP_ACCESS_TOKEN?.substring(0,20));

  this.phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  this.token = process.env.WHATSAPP_ACCESS_TOKEN;

  console.log("THIS PHONE:", this.phoneId);

  this.baseURL = `https://graph.facebook.com/v23.0/${this.phoneId}`;

}

 async request(endpoint, body) {

  console.log("================================");
  console.log("TOKEN:", this.token);
  console.log("PHONE:", this.phoneId);
  console.log("URL:", `${this.baseURL}${endpoint}`);
  console.log("BODY:", body);
  console.log("================================");

  const response = await axios({
    method: "POST",
    url: `${this.baseURL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${this.token}`,
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

    console.log("PHONE ID:", this.phoneId);

    console.log("TOKEN:", this.token.substring(0, 25));

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