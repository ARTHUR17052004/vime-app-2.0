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

        const status = error.response.status;

        let mensagem =
          error.response.data?.message ||
          (Array.isArray(error.response.data?.errors)
            ? error.response.data.errors.join(" ")
            : null);

        if (!mensagem && status === 403) {
          mensagem =
            "A Clicksign recusou essa ação (permissão negada). Documentos em rascunho (sem nenhum signatário) só podem ser removidos direto pelo site da Clicksign.";
        }

        const erro = new Error(mensagem || "Erro ao comunicar com a Clicksign.");
        erro.status = status && status < 500 ? status : 502;

        throw erro;

      }

      throw new Error(
        error.message || "Erro desconhecido na Clicksign."
      );

    }

  }

  async criarDocumento(documento) {

    const doc = documento?.document;

    if (doc?.content_base64 && !doc.content_base64.startsWith("data:")) {

      // A Clicksign exige o mimetype embutido no content_base64
      // (data:<mimetype>;base64,<conteudo>) — sem isso ela rejeita com
      // "MimeType não informado no campo content_base64".
      const extensao = (doc.path || "").split(".").pop()?.toLowerCase();

      const mimeTypes = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      const mimeType = mimeTypes[extensao] || "application/pdf";

      doc.content_base64 = `data:${mimeType};base64,${doc.content_base64}`;

    }

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

  // Baixa o arquivo de verdade (o PDF com a assinatura/autenticação da
  // Clicksign já aplicada), não só os metadados. A URL de download que
  // eles devolvem expira em poucos minutos, então busca sempre na hora.
  async baixarArquivoDocumento(id) {

    const resposta = await this.buscarDocumento(id);

    const url = resposta?.document?.downloads?.original_file_url;

    if (!url) {
      throw new Error("A Clicksign não retornou um link de download para esse documento.");
    }

    const download = await axios.get(url, { responseType: "arraybuffer" });

    return Buffer.from(download.data);

  }

  async atualizarDocumento(id, documento) {

    return this.request(
      "PUT",
      `/documents/${id}`,
      documento
    );

  }

  async cancelarDocumento(id) {

    // A Clicksign não permite DELETE de documento não finalizado — o
    // jeito certo é mudar o status pra "canceled" via PATCH.
    return this.request(
      "PATCH",
      `/documents/${id}`,
      { document: { status: "canceled" } }
    );

  }

  // Fluxo real da API v1 da Clicksign para colocar um documento para
  // assinar: 1) criar o signatário (retorna um "key" próprio dele),
  // 2) vincular esse signatário ao documento através de uma "lista".
  async criarSignatario(signatario) {

    // A Clicksign espera "auths" como array (ex: ["email"]) — não
    // "auth_mode" como string única.
    const { auth_mode, ...resto } = signatario || {};

    const signerNormalizado = {
      ...resto,
      auths: signatario?.auths || (auth_mode ? [auth_mode] : ["email"]),
    };

    return this.request(
      "POST",
      "/signers",
      { signer: signerNormalizado }
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
