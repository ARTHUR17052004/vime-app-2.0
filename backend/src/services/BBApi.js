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
    // Cache em memória por client_id -- token do BB dura 600s (10 min).
    // Com várias contas BB (uma por locador, no futuro), cada uma tem
    // client_id diferente, então não dá pra ter um token só global.
    this._tokens = {};
  }

  // `override` é o JSON `credenciais` de um ContaPagamento (provider
  // "BB") -- mesmo padrão do AsaasApi.obterConfig(override). Sem
  // override, cai nas variáveis de ambiente (uso direto/testes).
  obterConfig(override = null) {

    const ambiente =
      override?.ambiente || process.env.BB_AMBIENTE || "homologacao";

    return {
      clientId: override?.clientId || process.env.BB_CLIENT_ID || "",
      clientSecret: override?.clientSecret || process.env.BB_CLIENT_SECRET || "",
      appKey: override?.appKey || process.env.BB_APP_KEY || "",
      ambiente,
      oauthURL: OAUTH_URLS[ambiente] || OAUTH_URLS.homologacao,
      apiURL: API_URLS[ambiente] || API_URLS.homologacao,
      // Convênio/Carteira só existem depois que o gerente libera --
      // ficam vazios até lá, e criarBoleto() explica isso no erro.
      numeroConvenio: override?.numeroConvenio || process.env.BB_NUMERO_CONVENIO || "",
      numeroCarteira: override?.numeroCarteira || process.env.BB_NUMERO_CARTEIRA || "",
      numeroVariacaoCarteira: override?.numeroVariacaoCarteira || process.env.BB_VARIACAO_CARTEIRA || "",
      agenciaBeneficiario: override?.agencia || process.env.BB_AGENCIA || "",
      contaBeneficiario: override?.conta || process.env.BB_CONTA || "",
    };

  }

  // Autentica via OAuth2 client_credentials (Basic client_id:client_secret
  // no header, grant_type + escopo no corpo) -- fluxo confirmado
  // funcionando ao vivo contra oauth.hm.bb.com.br.
  async obterToken(override = null) {

    const { clientId, clientSecret, oauthURL } = this.obterConfig(override);

    if (!clientId || !clientSecret) {
      throw new Error(
        "Client ID/Secret do BB não configurados."
      );
    }

    const agora = Date.now();
    const cache = this._tokens[clientId];

    if (cache && agora < cache.expiraEm) {
      return cache.token;
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

      // Renova 30s antes de vencer, de propósito -- margem de segurança
      // pra não usar um token vencido bem na hora H.
      this._tokens[clientId] = {
        token: resposta.data.access_token,
        expiraEm: agora + (resposta.data.expires_in - 30) * 1000,
      };

      return resposta.data.access_token;

    } catch (error) {

      const mensagem =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.message;

      throw new Error(`Erro ao autenticar no BB: ${mensagem}`);

    }

  }

  async request(method, endpoint, body = null, params = {}, override = null) {

    const { appKey, apiURL } = this.obterConfig(override);

    if (USAR_MOCK) {
      return { success: true, mock: true, method, endpoint, body, params };
    }

    const token = await this.obterToken(override);

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

      // O BB não é consistente nem entre os próprios endpoints -- já
      // confirmado ao vivo em 3 formatos diferentes de erro:
      // 1) erros[].textoMensagem / textoProvidencia
      // 2) erros[].mensagem / providencia
      // 3) errors[].message / action
      // Tenta os três antes de cair no genérico do axios.
      const dadosErro = error.response?.data;
      const primeiroErro = dadosErro?.erros?.[0] || dadosErro?.errors?.[0];

      const texto =
        primeiroErro?.textoMensagem ||
        primeiroErro?.mensagem ||
        primeiroErro?.message;

      const providencia =
        primeiroErro?.textoProvidencia ||
        primeiroErro?.providencia ||
        primeiroErro?.action;

      const mensagem =
        (texto && `${texto}${providencia ? ` (${providencia})` : ""}`) ||
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

  // "Nosso Número" pro formato JSON da API (confirmado no manual oficial
  // -- diferente do formato de impressão do boleto em papel, que é
  // outro documento): STRING de 20 dígitos = "000" + convênio (7
  // dígitos) + número de controle escolhido por nós (10 dígitos,
  // zeros à esquerda). Guarda só o número de controle -- essa função
  // monta o resto.
  montarNumeroTituloCliente(numeroControle, override = null) {

    const { numeroConvenio } = this.obterConfig(override);

    const convenio = String(numeroConvenio).padStart(7, "0");
    const controle = String(numeroControle).padStart(10, "0");

    return `000${convenio}${controle}`;

  }

  async criarBoleto(dados, override = null) {

    const {
      numeroConvenio,
      numeroCarteira,
      numeroVariacaoCarteira,
    } = this.obterConfig(override);

    if (!numeroConvenio) {
      throw new Error(
        "Número do Convênio de Cobrança ainda não configurado para essa conta BB."
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
      numeroTituloCliente: this.montarNumeroTituloCliente(dados.numeroControle, override),
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
    }, {}, override);

  }

  async consultarBoleto(numeroControle, override = null) {

    const { numeroConvenio } = this.obterConfig(override);

    return this.request(
      "GET",
      `/cobrancas/v2/boletos/${this.montarNumeroTituloCliente(numeroControle, override)}`,
      null,
      { numeroConvenio: Number(numeroConvenio) },
      override
    );

  }

  async baixarBoleto(numeroControle, override = null) {

    const { numeroConvenio } = this.obterConfig(override);

    return this.request(
      "POST",
      `/cobrancas/v2/boletos/${this.montarNumeroTituloCliente(numeroControle, override)}/baixar`,
      { numeroConvenio: Number(numeroConvenio) },
      {},
      override
    );

  }

}

module.exports = new BBApi();
