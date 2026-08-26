const axios = require("axios");

const prisma = require("../config/prisma");

const USAR_MOCK = process.env.CLICKSIGN_MOCK === "true";

const BASE_URLS = {
  sandbox: "https://sandbox.clicksign.com/api/v3",
  producao: "https://app.clicksign.com/api/v3",
};

// Cliente da API v3 da Clicksign (Envelopes) -- usado especificamente pro
// fluxo de "gerar documento a partir de Modelo com dados" (contrato de
// locação). A integração antiga (ClicksignApi.js, API v1) continua ativa
// pra outros usos (tela de Documentos avulsos em /clicksign).
class ClicksignApiV3 {

  async obterConfig() {

    const configuracao = await prisma.configuracao.findFirst({
      orderBy: { id: "asc" },
    });

    const apiKey = configuracao?.clicksignToken || process.env.CLICKSIGN_API_KEY || "";
    const ambiente = configuracao?.clicksignAmbiente || process.env.CLICKSIGN_ENV || "sandbox";
    const templateKey = configuracao?.clicksignTemplateKey || null;

    const baseURL = process.env.CLICKSIGN_API_V3_URL || BASE_URLS[ambiente] || BASE_URLS.sandbox;

    return { apiKey, ambiente, baseURL, templateKey };

  }

  async request(method, endpoint, body = null) {

    const { apiKey, baseURL } = await this.obterConfig();

    if (USAR_MOCK || !apiKey) {

      // Simula um id/key plausível pra quem chama conseguir seguir o
      // fluxo normalmente em modo mock (ex: usar o id retornado na
      // próxima chamada), sem precisar de rede.
      const tipo = endpoint.split("/").pop().split("?")[0];

      return {
        success: true,
        mock: true,
        method,
        endpoint,
        body,
        data: { id: `mock-${tipo}-${Date.now()}`, type: tipo },
      };

    }

    try {

      const response = await axios({
        method,
        url: `${baseURL}${endpoint}`,
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        data: body,
      });

      return response.data;

    } catch (error) {

      console.error("Erro Clicksign (v3):");

      if (error.response) {

        console.error(JSON.stringify(error.response.data));

        const status = error.response.status;

        const mensagem =
          error.response.data?.errors?.[0]?.detail ||
          error.response.data?.errors?.[0]?.title ||
          error.response.data?.message ||
          null;

        const erro = new Error(mensagem || "Erro ao comunicar com a Clicksign (v3).");
        erro.status = status && status < 500 ? status : 502;

        throw erro;

      }

      throw new Error(error.message || "Erro desconhecido na Clicksign (v3).");

    }

  }

  async criarEnvelope(nome) {

    const resposta = await this.request("POST", "/envelopes", {
      data: {
        type: "envelopes",
        attributes: { name: nome },
      },
    });

    return resposta?.data?.id || null;

  }

  // Gera o documento dentro do envelope a partir do Modelo cadastrado na
  // Clicksign + os dados reais do contrato (mesmos nomes de campo do
  // modelo, ver docs/modelo-contrato-clicksign.txt).
  async criarDocumentoDeModelo(envelopeId, templateKey, dados, nomeArquivo) {

    const resposta = await this.request("POST", `/envelopes/${envelopeId}/documents`, {
      data: {
        type: "documents",
        attributes: {
          template: {
            key: templateKey,
            data: dados,
          },
          filename: nomeArquivo,
        },
      },
    });

    return resposta?.data?.id || null;

  }

  async adicionarSignatario(envelopeId, { nome, email }) {

    const resposta = await this.request("POST", `/envelopes/${envelopeId}/signers`, {
      data: {
        type: "signers",
        attributes: { name: nome, email },
      },
    });

    return resposta?.data?.id || null;

  }

  // Cada signatário precisa de 2 "requirements" pra poder assinar: um de
  // qualificação (papel = assinar) e um de autenticação (como confirma
  // identidade -- usamos e-mail, mesmo padrão já usado na v1).
  async criarRequisitosAssinatura(envelopeId, documentId, signerId, papel = "sign") {

    await this.request("POST", `/envelopes/${envelopeId}/requirements`, {
      data: {
        type: "requirements",
        attributes: { action: "agree", role: papel },
        relationships: {
          document: { data: { type: "documents", id: documentId } },
          signer: { data: { type: "signers", id: signerId } },
        },
      },
    });

    await this.request("POST", `/envelopes/${envelopeId}/requirements`, {
      data: {
        type: "requirements",
        attributes: { action: "provide_evidence", auth: "email" },
        relationships: {
          document: { data: { type: "documents", id: documentId } },
          signer: { data: { type: "signers", id: signerId } },
        },
      },
    });

  }

  async ativarEnvelope(envelopeId) {

    return this.request("PATCH", `/envelopes/${envelopeId}`, {
      data: {
        id: envelopeId,
        type: "envelopes",
        attributes: { status: "running" },
      },
    });

  }

  async enviarNotificacoes(envelopeId) {

    return this.request("POST", `/envelopes/${envelopeId}/notifications`, {
      data: {
        type: "notifications",
      },
    });

  }

  async buscarEnvelope(envelopeId) {

    return this.request("GET", `/envelopes/${envelopeId}`);

  }

  async buscarDocumento(envelopeId, documentId) {

    return this.request("GET", `/envelopes/${envelopeId}/documents/${documentId}`);

  }

  // Baixa o arquivo de verdade (com a assinatura/autenticação aplicada,
  // depois de todos assinarem). A URL que a Clicksign devolve expira em
  // pouco tempo, então busca sempre na hora.
  async baixarArquivoDocumento(envelopeId, documentId) {

    const resposta = await this.buscarDocumento(envelopeId, documentId);

    const url = resposta?.data?.links?.files?.original || resposta?.data?.links?.files?.signed;

    if (!url) {
      throw new Error("A Clicksign não retornou um link de download para esse documento.");
    }

    const download = await axios.get(url, { responseType: "arraybuffer" });

    return Buffer.from(download.data);

  }

}

module.exports = new ClicksignApiV3();
