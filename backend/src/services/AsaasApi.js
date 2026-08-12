const axios = require("axios");

const prisma = require("../config/prisma");

const USAR_MOCK =
    process.env.ASAAS_MOCK === "true";

const BASE_URLS = {
  sandbox: "https://sandbox.asaas.com/api/v3",
  producao: "https://api.asaas.com/v3",
};

class AsaasApi {

  async obterConfig() {

    const configuracao = await prisma.configuracao.findFirst({
      orderBy: { id: "asc" },
    });

    const apiKey =
      configuracao?.asaasToken ||
      process.env.ASAAS_API_KEY ||
      "";

    const ambiente =
      configuracao?.asaasAmbiente ||
      process.env.ASAAS_ENV ||
      "sandbox";

    const baseURL =
      process.env.ASAAS_API_URL ||
      BASE_URLS[ambiente] ||
      BASE_URLS.sandbox;

    return {
      apiKey,
      ambiente,
      baseURL,
      walletId: configuracao?.asaasWalletId || "",
      webhookToken: configuracao?.asaasWebhookToken || "",
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

      const response = await axios({

        method,

        url: `${baseURL}${endpoint}`,

        headers: {

          access_token: apiKey,

          "Content-Type": "application/json"

        },

        data: body

      });

      return response.data;

    } catch (error) {

      console.error("Erro Asaas:");

      if (error.response) {

        console.error(error.response.data);

        throw new Error(
          error.response.data.errors?.[0]?.description ||
          "Erro ao comunicar com o Asaas."
        );

      }

      throw new Error(
        error.message || "Erro desconhecido no Asaas."
      );

    }

  }

  async minhaConta() {

    return this.request(
      "GET",
      "/myAccount"
    );

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

  async listarCobrancas(query = "") {

    return this.request(
      "GET",
      `/payments${query}`
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
  // WEBHOOKS
  // ==========================

  async configurarWebhook(url, token, eventos) {

    return this.request(
      "PUT",
      "/webhook",
      {
        url,
        email: undefined,
        enabled: true,
        interrupted: false,
        apiVersion: 3,
        authToken: token,
        events: eventos,
      }
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

}


module.exports = new AsaasApi();
