const axios = require("axios");

const USAR_MOCK =
    process.env.ASAAS_MOCK === "true";

class AsaasApi {

  constructor() {

    this.baseURL =
      process.env.ASAAS_API_URL ||
      "https://sandbox.asaas.com/api/v3";

    this.apiKey =
      process.env.ASAAS_API_KEY || "";

  }

  async request(method, endpoint, body = null) {

  // ===== MOCK FORÇADO =====

  if (USAR_MOCK) {

    return {
      success: true,
      mock: true,
      method,
      endpoint,
      body
    };

  }

  // ===== MOCK AUTOMÁTICO (sem API Key) =====

  if (!this.apiKey) {

    return {
      success: true,
      mock: true,
      method,
      endpoint,
      body
    };

  }

  // ===== API REAL =====

  const response = await axios({

      method,

      url: `${this.baseURL}${endpoint}`,

      headers: {

        access_token: this.apiKey,

        "Content-Type": "application/json"

      },

      data: body

    });

    return response.data;

  }

    async criarCliente(cliente) {

    return this.request(

      "POST",

      "/customers",

      cliente

    );

  }

  async listarClientes() {

    return this.request(

      "GET",

      "/customers"

    );

  }

  async buscarCliente(id) {

    return this.request(

      "GET",

      `/customers/${id}`

    );

  }

  async atualizarCliente(id, cliente) {

    return this.request(

      "PUT",

      `/customers/${id}`,

      cliente

    );

  }

  async removerCliente(id) {

    return this.request(

      "DELETE",

      `/customers/${id}`

    );

  }

  async criarCobranca(cobranca) {

    return this.request(
      "POST",
      "/payments",
      cobranca
    );

  }

  async listarCobrancas() {

    return this.request(
      "GET",
      "/payments"
    );

  }

  async buscarCobranca(id) {

    return this.request(
      "GET",
      `/payments/${id}`
    );

  }

  async atualizarCobranca(id, cobranca) {

    return this.request(
      "PUT",
      `/payments/${id}`,
      cobranca
    );

  }

  async cancelarCobranca(id) {

    return this.request(
      "DELETE",
      `/payments/${id}`
    );

  }

    // ==========================
  // RECEBIMENTOS
  // ==========================

  async receberPagamento(id) {

    return this.request(
      "POST",
      `/payments/${id}/receive`
    );

  }

  async estornarPagamento(id) {

    return this.request(
      "POST",
      `/payments/${id}/refund`
    );

  }

  async restaurarPagamento(id) {

    return this.request(
      "POST",
      `/payments/${id}/restore`
    );

  }

  // ==========================
  // WEBHOOKS
  // ==========================

  async receberWebhook(dados) {

    console.log("Webhook Asaas recebido:");

    console.log(dados);

    return {
      success: true,
      recebido: true,
      dados
    };

  }

}


module.exports = new AsaasApi();