const axios = require("axios");

// ESQUELETO -- NADA AQUI FOI CONFIRMADO CONTRA O BRB DE VERDADE.
//
// O BRB (Banco de Brasília) não tem portal de desenvolvedor público
// (diferente de BB, Asaas e EFI) -- o acesso é liberado só pelo
// gerente da conta, e com ele vem o manual técnico de integração.
// Sem esse manual em mãos, não tem como saber o endpoint real, os
// nomes de campo, nem o formato de autenticação exatos.
//
// Esse arquivo só existe pra já deixar a estrutura pronta, copiando o
// mesmo formato de BBApi.js (outro banco público, mesmo "formato
// Cobranças" que a maioria dos bancos brasileiros usa) como ponto de
// partida mais provável. QUANDO o manual do BRB chegar, o certo é:
// 1. Conferir a URL de autenticação e de criação de boleto (prováveis
//    candidatas abaixo, só palpite).
// 2. Conferir o nome de cada campo do payload de criarBoleto().
// 3. Conferir o formato da resposta (pra ajustar o mapeamento em
//    gatewayPagamentoService.enviarPeloBRB).
// 4. Só depois disso testar em homologação antes de vincular qualquer
//    locador de verdade a essa conta.
const USAR_MOCK = process.env.BRB_MOCK === "true";

// Palpite -- a maioria dos bancos segue "oauth.<banco>.com.br" /
// "api.<banco>.com.br", separando homologação com um ".hm." no meio
// (como o BB faz). Confirmar contra o manual real.
const OAUTH_URLS = {
  homologacao: "https://oauth.hm.brb.com.br/oauth/token",
  producao: "https://oauth.brb.com.br/oauth/token",
};

const API_URLS = {
  homologacao: "https://api.hm.brb.com.br",
  producao: "https://api.brb.com.br",
};

class BRBApi {

  constructor() {
    this._tokens = {};
  }

  // `override` é o JSON `credenciais` de um ContaPagamento (provider
  // "BRB") -- mesmo padrão de BBApi/AsaasApi/EFIApi. Campos aqui
  // (numeroConvenio, numeroCarteira...) são o palpite baseado no
  // formato do BB -- ajustar assim que soubermos os nomes reais que o
  // BRB pede.
  obterConfig(override = null) {

    const ambiente = override?.ambiente || process.env.BRB_AMBIENTE || "homologacao";

    return {
      clientId: override?.clientId || process.env.BRB_CLIENT_ID || "",
      clientSecret: override?.clientSecret || process.env.BRB_CLIENT_SECRET || "",
      ambiente,
      oauthURL: OAUTH_URLS[ambiente] || OAUTH_URLS.homologacao,
      apiURL: API_URLS[ambiente] || API_URLS.homologacao,
      numeroConvenio: override?.numeroConvenio || process.env.BRB_NUMERO_CONVENIO || "",
      numeroCarteira: override?.numeroCarteira || process.env.BRB_NUMERO_CARTEIRA || "",
      agencia: override?.agencia || process.env.BRB_AGENCIA || "",
      conta: override?.conta || process.env.BRB_CONTA || "",
    };

  }

  async obterToken(override = null) {

    const { clientId, clientSecret, oauthURL } = this.obterConfig(override);

    if (!clientId || !clientSecret) {
      throw new Error("Client ID/Secret do BRB não configurados.");
    }

    const agora = Date.now();
    const cache = this._tokens[clientId];

    if (cache && agora < cache.expiraEm) {
      return cache.token;
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {

      const resposta = await axios.post(
        oauthURL,
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basic}`,
          },
          timeout: 15000,
        }
      );

      this._tokens[clientId] = {
        token: resposta.data.access_token,
        expiraEm: agora + ((resposta.data.expires_in || 600) - 30) * 1000,
      };

      return resposta.data.access_token;

    } catch (error) {

      const mensagem =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.message;

      throw new Error(`Erro ao autenticar no BRB: ${mensagem}`);

    }

  }

  async request(method, endpoint, body = null, params = {}, override = null) {

    const { apiURL } = this.obterConfig(override);

    if (USAR_MOCK) {
      return { success: true, mock: true, method, endpoint, body, params };
    }

    const token = await this.obterToken(override);

    try {

      const resposta = await axios({
        method,
        url: `${apiURL}${endpoint}`,
        data: body || undefined,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      });

      return resposta.data;

    } catch (error) {

      const dadosErro = error.response?.data;

      const mensagem =
        dadosErro?.mensagem ||
        dadosErro?.message ||
        dadosErro?.error_description ||
        error.message;

      console.error("Erro BRB:", dadosErro || error.message);

      throw new Error(mensagem);

    }

  }

  // ==========================
  // COBRANÇAS (boleto)
  // ==========================
  //
  // PALPITE TOTAL -- endpoint, nomes de campo e formato de resposta
  // aqui são copiados do padrão do BB só pra ter uma estrutura
  // rodando. Substituir pelo payload real assim que o manual do BRB
  // chegar -- não usar isso contra produção antes disso.
  async criarBoleto(dados, override = null) {

    const { numeroConvenio, numeroCarteira } = this.obterConfig(override);

    if (!numeroConvenio) {
      throw new Error("Número do Convênio de Cobrança ainda não configurado para essa conta BRB.");
    }

    const resultado = await this.request("POST", "/cobrancas/v1/boletos", {
      numeroConvenio: Number(numeroConvenio),
      numeroCarteira: Number(numeroCarteira),
      dataEmissao: dados.dataEmissao,
      dataVencimento: dados.dataVencimento,
      valorOriginal: dados.valor,
      numeroTituloBeneficiario: dados.numeroTituloBeneficiario,
      pagador: {
        tipoInscricao: dados.pagador.tipoInscricao,
        numeroInscricao: dados.pagador.numeroInscricao,
        nome: dados.pagador.nome,
        endereco: dados.pagador.endereco,
        cep: dados.pagador.cep,
        cidade: dados.pagador.cidade,
        bairro: dados.pagador.bairro,
        uf: dados.pagador.uf,
      },
    }, {}, override);

    return {
      numero: resultado?.numero,
      linhaDigitavel: resultado?.linhaDigitavel,
      urlImagemBoleto: resultado?.urlImagemBoleto,
    };

  }

}

module.exports = new BRBApi();
