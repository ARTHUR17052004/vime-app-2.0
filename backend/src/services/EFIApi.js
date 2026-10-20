const axios = require("axios");
const https = require("https");

// ATENÇÃO (ler antes de usar pra valer): esqueleto construído a partir
// do conhecimento geral da API de Cobranças da EFI (ex-Gerencianet) --
// NÃO foi confirmado ao vivo contra um sandbox de verdade ainda
// (precisa de Client ID/Secret/certificado reais pra isso, que ainda
// não temos). O fluxo de autenticação (OAuth2 + mTLS com o
// certificado da aplicação) está certo com bastante confiança; os
// nomes exatos de campo/endpoint de criarBoleto() são o melhor palpite
// e PRECISAM ser conferidos contra a documentação oficial (ou um teste
// real em homologação) antes de confiar no resultado. Mesma lógica do
// aviso que já existe em BBApi.js.
const USAR_MOCK = process.env.EFI_MOCK === "true";

const API_URLS = {
  homologacao: "https://cobrancas-h.api.efipay.com.br",
  producao: "https://cobrancas.api.efipay.com.br",
};

class EFIApi {

  constructor() {
    // Token dura pouco (igual BB) -- cache em memória por clientId,
    // uma conta EFI por locador no futuro vai ter client_id diferente.
    this._tokens = {};
  }

  // `override` é o JSON `credenciais` de um ContaPagamento (provider
  // "EFI") -- mesmo padrão de BBApi.obterConfig/AsaasApi.obterConfig.
  obterConfig(override = null) {

    const ambiente = override?.ambiente || process.env.EFI_AMBIENTE || "homologacao";

    return {
      clientId: override?.clientId || process.env.EFI_CLIENT_ID || "",
      clientSecret: override?.clientSecret || process.env.EFI_CLIENT_SECRET || "",
      // Certificado da aplicação (.p12) em base64 -- vem colado na tela
      // de Contas (campo "multilinha"). Obrigatório: a API da EFI
      // autentica com mTLS, não só client_id/secret.
      certificadoBase64: override?.certificado || process.env.EFI_CERTIFICADO || "",
      ambiente,
      apiURL: API_URLS[ambiente] || API_URLS.homologacao,
    };

  }

  // Monta o agente HTTPS com o certificado da aplicação -- toda
  // chamada (até o /oauth/token) precisa dele, diferente do BB que só
  // pede client_id/secret na autenticação.
  _agenteHttps(override = null) {

    const { certificadoBase64 } = this.obterConfig(override);

    if (!certificadoBase64) {
      throw new Error("Certificado da aplicação EFI (.p12) não configurado para essa conta.");
    }

    return new https.Agent({
      pfx: Buffer.from(certificadoBase64, "base64"),
      // EFI não costuma exigir senha no .p12 gerado pelo próprio
      // painel deles -- se a conta de vocês pedir, adicionar um campo
      // "certificadoSenha" na tela de Contas e passar aqui.
      passphrase: override?.certificadoSenha || "",
    });

  }

  async obterToken(override = null) {

    const { clientId, clientSecret, apiURL } = this.obterConfig(override);

    if (!clientId || !clientSecret) {
      throw new Error("Client ID/Secret da EFI não configurados.");
    }

    const agora = Date.now();
    const cache = this._tokens[clientId];

    if (cache && agora < cache.expiraEm) {
      return cache.token;
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {

      const resposta = await axios.post(
        `${apiURL}/v1/authorize`,
        { grant_type: "client_credentials" },
        {
          headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/json",
          },
          httpsAgent: this._agenteHttps(override),
          timeout: 15000,
        }
      );

      // EFI costuma dar token de 1h (3600s) -- renova 30s antes de
      // vencer, mesma margem de segurança do BB.
      this._tokens[clientId] = {
        token: resposta.data.access_token,
        expiraEm: agora + ((resposta.data.expires_in || 3600) - 30) * 1000,
      };

      return resposta.data.access_token;

    } catch (error) {

      const mensagem =
        error.response?.data?.error_description ||
        error.response?.data?.mensagem ||
        error.message;

      throw new Error(`Erro ao autenticar na EFI: ${mensagem}`);

    }

  }

  async request(method, endpoint, body = null, override = null) {

    const { apiURL } = this.obterConfig(override);

    if (USAR_MOCK) {
      return { success: true, mock: true, method, endpoint, body };
    }

    const token = await this.obterToken(override);

    try {

      const resposta = await axios({
        method,
        url: `${apiURL}${endpoint}`,
        data: body || undefined,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        httpsAgent: this._agenteHttps(override),
        timeout: 20000,
      });

      return resposta.data;

    } catch (error) {

      const dadosErro = error.response?.data;

      const mensagem =
        dadosErro?.nome && dadosErro?.mensagem
          ? `${dadosErro.nome}: ${dadosErro.mensagem}`
          : dadosErro?.mensagem ||
            dadosErro?.error_description ||
            error.message;

      console.error("Erro EFI:", dadosErro || error.message);

      throw new Error(mensagem);

    }

  }

  // ==========================
  // COBRANÇAS (boleto)
  // ==========================
  //
  // ATENÇÃO: igual o aviso lá em cima -- o endpoint e o formato exato
  // do payload (POST /v1/charge/one-step, cobrindo boleto avulso) é o
  // melhor palpite a partir do conhecimento geral da API de Cobranças
  // da EFI, NÃO confirmado ao vivo. Antes de usar de verdade, testar
  // em homologação e ajustar aqui o que vier diferente.
  async criarBoleto(dados, override = null) {

    const resultado = await this.request("POST", "/v1/charge/one-step", {
      items: [
        {
          name: dados.descricao || "Cobrança",
          value: Math.round(Number(dados.valor) * 100), // EFI trabalha em centavos
          amount: 1,
        },
      ],
      payment: {
        banking_billet: {
          customer: {
            name: dados.pagador.nome,
            cpf: dados.pagador.cpf, // só dígitos
            email: dados.pagador.email || undefined,
            phone_number: dados.pagador.telefone || undefined,
          },
          expire_at: dados.dataVencimento, // formato AAAA-MM-DD
        },
      },
    }, override);

    // Formato de resposta também é melhor palpite -- conferir contra
    // o real assim que tivermos credencial, e ajustar o mapeamento em
    // gatewayPagamentoService.enviarPelaEFI de acordo.
    const dadosCobranca = resultado?.data || resultado;

    return {
      numero: dadosCobranca?.charge_id || dadosCobranca?.identifiers?.charge_id,
      linhaDigitavel: dadosCobranca?.payment?.banking_billet?.barcode,
      urlImagemBoleto: dadosCobranca?.payment?.banking_billet?.pdf?.charge,
    };

  }

}

module.exports = new EFIApi();
