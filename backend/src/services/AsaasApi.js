const https = require("https");

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
      email: configuracao?.email?.trim() || process.env.ASAAS_WEBHOOK_EMAIL || "",
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

    // O WAF/CloudFront da Asaas bloqueia (403 genérico, sem chegar na
    // API deles) requisições feitas via axios, mesmo com headers
    // idênticos — mas aceita o módulo "https" nativo do Node numa
    // chamada idêntica. Por isso essa chamada usa https.request direto
    // (as outras integrações, como Clicksign, continuam com axios sem
    // problema — esse bloqueio é específico da Asaas).
    try {

      return await this.requestNativo(method, baseURL, endpoint, apiKey, body);

    } catch (error) {

      console.error("Erro Asaas:", error.message);

      throw error;

    }

  }

  requestNativo(method, baseURL, endpoint, apiKey, body) {

    return new Promise((resolve, reject) => {

      const url = new URL(`${baseURL}${endpoint}`);

      const payload = body ? JSON.stringify(body) : null;

      const headers = {
        access_token: apiKey,
        "Content-Type": "application/json",
        "User-Agent": "VIME-2.0 (contato@vimesistema.online)",
      };

      if (payload) {
        headers["Content-Length"] = Buffer.byteLength(payload);
      }

      const req = https.request(
        {
          hostname: url.hostname,
          path: `${url.pathname}${url.search}`,
          method,
          headers,
        },
        (res) => {

          let data = "";
          res.on("data", (chunk) => { data += chunk; });

          res.on("end", () => {

            let json = {};

            try {
              json = data ? JSON.parse(data) : {};
            } catch {
              return reject(new Error("A Asaas não retornou um JSON válido."));
            }

            if (res.statusCode >= 200 && res.statusCode < 300) {
              return resolve(json);
            }

            console.error("Erro Asaas (resposta):", json);

            const mensagem =
              json.errors?.[0]?.description ||
              json.message ||
              `Erro ao comunicar com a Asaas (HTTP ${res.statusCode}).`;

            reject(new Error(mensagem));

          });

        }
      );

      req.on("error", (err) => {
        reject(new Error(err.message || "Erro desconhecido na Asaas."));
      });

      if (payload) req.write(payload);

      req.end();

    });

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

    const { email } = await this.obterConfig();

    if (!email) {
      throw new Error(
        "Configure o e-mail da empresa em Configurações antes de registrar o webhook — a Asaas exige um e-mail de contato para notificações."
      );
    }

    return this.request(
      "PUT",
      "/webhook",
      {
        url,
        email,
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
