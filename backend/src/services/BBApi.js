const axios = require("axios");

// Ainda lê direto do .env -- quando a reforma "Contas" (multi-banco)
// sair, isso passa a vir do banco, igual o Asaas já faz hoje via
// Configuracao. Por enquanto, só o Banco do Brasil, uma conta só.
const USAR_MOCK = process.env.BB_MOCK === "true";

const OAUTH_URLS = {
  homologacao: "https://oauth.hm.bb.com.br/oauth/token",
  producao: "https://oauth.bb.com.br/oauth/token",
};

const API_URLS = {
  homologacao: "https://api.hm.bb.com.br",
  producao: "https://api.bb.com.br",
};

// Escopos da API de Cobranças v2 -- confirmado ao vivo em homologação
// em 01/09/2026 (gerou token normalmente com esses escopos).
const ESCOPO_COBRANCAS =
  "cobrancas.boletos-requisicao cobrancas.boletos-info";

class BBApi {

  constructor() {
    // Cache simples em memória -- token do BB dura 600s (10 min); evita
    // logar de novo a cada chamada.
    this._token = null;
    this._tokenExpiraEm = 0;
  }

  obterConfig() {

    const ambiente = process.env.BB_AMBIENTE || "homologacao";

    return {
      clientId: process.env.BB_CLIENT_ID || "",
      clientSecret: process.env.BB_CLIENT_SECRET || "",
      appKey: process.env.BB_APP_KEY || "",
      ambiente,
      oauthURL: OAUTH_URLS[ambiente] || OAUTH_URLS.homologacao,
      apiURL: API_URLS[ambiente] || API_URLS.homologacao,
      // Convênio/Carteira só existem depois que o gerente libera --
      // ficam vazios até lá, e criarBoleto() explica isso no erro.
      numeroConvenio: process.env.BB_NUMERO_CONVENIO || "",
      numeroCarteira: process.env.BB_NUMERO_CARTEIRA || "",
      numeroVariacaoCarteira: process.env.BB_VARIACAO_CARTEIRA || "",
      agenciaBeneficiario: process.env.BB_AGENCIA || "",
      contaBeneficiario: process.env.BB_CONTA || "",
    };

  }

  // Autentica via OAuth2 client_credentials (Basic client_id:client_secret
  // no header, grant_type + escopo no corpo) -- fluxo confirmado
  // funcionando ao vivo contra oauth.hm.bb.com.br.
  async obterToken() {

    const agora = Date.now();

    if (this._token && agora < this._tokenExpiraEm) {
      return this._token;
    }

    const { clientId, clientSecret, oauthURL } = this.obterConfig();

    if (!clientId || !clientSecret) {
      throw new Error(
        "BB_CLIENT_ID/BB_CLIENT_SECRET não configurados (.env)."
      );
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    try {

      const resposta = await axios.post(
        oauthURL,
        `grant_type=client_credentials&scope=${encodeURIComponent(ESCOPO_COBRANCAS)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basic}`,
          },
          timeout: 15000,
        }
      );

      this._token = resposta.data.access_token;
      // Renova 30s antes de vencer, de propósito -- margem de segurança
      // pra não usar um token vencido bem na hora H.
      this._tokenExpiraEm = agora + (resposta.data.expires_in - 30) * 1000;

      return this._token;

    } catch (error) {

      const mensagem =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.message;

      throw new Error(`Erro ao autenticar no BB: ${mensagem}`);

    }

  }

  async request(method, endpoint, body = null, params = {}) {

    const { appKey, apiURL } = this.obterConfig();

    if (USAR_MOCK) {
      return { success: true, mock: true, method, endpoint, body, params };
    }

    const token = await this.obterToken();

    try {

      const resposta = await axios({
        method,
        url: `${apiURL}${endpoint}`,
        data: body || undefined,
        params: {
          "gw-dev-app-key": appKey,
          ...params,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      });

      return resposta.data;

    } catch (error) {

      // O BB não é consistente entre os próprios endpoints: uns devolvem
      // "erros[]" em português (textoMensagem/textoProvidencia), outros
      // "errors[]" em inglês (message/action) -- confirmado ao vivo,
      // testando /boletos (POST) vs /boletos/{numero} (GET). Trata os
      // dois formatos.
      const dadosErro = error.response?.data;

      const erroPt = dadosErro?.erros?.[0];
      const erroEn = dadosErro?.errors?.[0];

      const mensagem =
        (erroPt?.textoMensagem &&
          `${erroPt.textoMensagem}${erroPt.textoProvidencia ? ` (${erroPt.textoProvidencia})` : ""}`) ||
        (erroEn?.message &&
          `${erroEn.message}${erroEn.action ? ` (${erroEn.action})` : ""}`) ||
        dadosErro?.error_description ||
        error.message;

      console.error("Erro BB:", error.response?.data || error.message);

      throw new Error(mensagem);

    }

  }

  // ==========================
  // COBRANÇAS (boletos)
  // ==========================
  //
  // ATENÇÃO: os nomes de campo abaixo seguem o padrão documentado da
  // API Cobranças v2 do BB (confirmado em integrações reais já em
  // produção), mas a documentação oficial completa não pôde ser
  // conferida linha a linha ainda. Isso só é testável de verdade
  // depois que o Convênio de Cobrança existir -- até lá, qualquer
  // chamada aqui recebe "Contrato de cobrança não localizado" (já
  // confirmado ao vivo), o que é esperado.

  async criarBoleto(dados) {

    const {
      numeroConvenio,
      numeroCarteira,
      numeroVariacaoCarteira,
    } = this.obterConfig();

    if (!numeroConvenio) {
      throw new Error(
        "Número do Convênio de Cobrança ainda não configurado -- peça ao seu gerente do BB e defina BB_NUMERO_CONVENIO no .env."
      );
    }

    return this.request("POST", "/cobrancas/v2/boletos", {
      numeroConvenio: Number(numeroConvenio),
      numeroCarteira: Number(numeroCarteira),
      numeroVariacaoCarteira: Number(numeroVariacaoCarteira),
      codigoModalidade: 1,
      dataEmissao: dados.dataEmissao,
      dataVencimento: dados.dataVencimento,
      valorOriginal: dados.valor,
      codigoAceite: "N",
      codigoTipoTitulo: 2,
      descricaoTipoTitulo: "DM",
      indicadorPermissaoRecebimentoParcial: "N",
      numeroTituloBeneficiario: dados.numeroTituloBeneficiario,
      numeroTituloCliente: dados.numeroTituloCliente,
      indicadorPix: "S",
      pagador: {
        tipoInscricao: dados.pagador.tipoInscricao, // 1 = CPF, 2 = CNPJ
        numeroInscricao: dados.pagador.numeroInscricao,
        nome: dados.pagador.nome,
        endereco: dados.pagador.endereco,
        cep: dados.pagador.cep,
        cidade: dados.pagador.cidade,
        bairro: dados.pagador.bairro,
        uf: dados.pagador.uf,
      },
    });

  }

  async consultarBoleto(numeroBoleto) {

    const { numeroConvenio } = this.obterConfig();

    return this.request(
      "GET",
      `/cobrancas/v2/boletos/${numeroBoleto}`,
      null,
      { numeroConvenio: Number(numeroConvenio) }
    );

  }

  async baixarBoleto(numeroBoleto) {

    const { numeroConvenio } = this.obterConfig();

    return this.request(
      "POST",
      `/cobrancas/v2/boletos/${numeroBoleto}/baixar`,
      { numeroConvenio: Number(numeroConvenio) }
    );

  }

}

module.exports = new BBApi();
