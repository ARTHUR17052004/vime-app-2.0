class WhatsappService {

  async status() {
    return {
      conectado: true,
      mock: true
    };
  }

  async enviarMensagem(dados) {
    return {
      success: true,
      mock: true,
      enviado: dados
    };
  }

  async receberMensagem(dados) {
    return {
      success: true,
      mock: true,
      recebido: dados
    };
  }

  async webhook(dados) {
    console.log("Webhook WhatsApp:");
    console.log(dados);

    return {
      success: true
    };
  }

}

module.exports = new WhatsappService();