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

// EFI expõe a Cobranças e o Pix como APIs/hosts separados (mesmo
// Client ID/Secret + certificado da aplicação servem pras duas, ver
// painel: "Selecione a API" alterna entre elas) -- cada uma com seu
// próprio caminho de token.
const API_URLS = {
  cobrancas: {
    homologacao: "https://cobrancas-h.api.efipay.com.br",
    producao: "https://cobrancas.api.efipay.com.br",
  },
  pix: {
    homologacao: "https://pix-h.api.efipay.com.br",
    producao: "https://pix.api.efipay.com.br",
  },
};

const CAMINHO_TOKEN = {
  cobrancas: "/v1/authorize",
  pix: "/oauth/token",
};

class EFIApi {

  constructor() {
    // Token dura pouco (igual BB) -- cache em memória por
    // clientId+produto (Cobranças e Pix são hosts diferentes, token de
    // um não serve pro outro).
    this._tokens = {};
  }

  // `override` é o JSON `credenciais` de um ContaPagamento (provider
  // "EFI") -- mesmo padrão de BBApi.obterConfig/AsaasApi.obterConfig.
  obterConfig(override = null, produto = "cobrancas") {

    const ambiente = override?.ambiente || process.env.EFI_AMBIENTE || "homologacao";

    return {
      clientId: override?.clientId || process.env.EFI_CLIENT_ID || "",
      clientSecret: override?.clientSecret || process.env.EFI_CLIENT_SECRET || "",
      // Certificado da aplicação (.p12) em base64 -- vem colado na tela
      // de Contas (campo "multilinha"). Obrigatório: a API da EFI
      // autentica com mTLS, não só client_id/secret.
      certificadoBase64: override?.certificado || process.env.EFI_CERTIFICADO || "",
      ambiente,
      apiURL: (API_URLS[produto] || API_URLS.cobrancas)[ambiente] || API_URLS.cobrancas.homologacao,
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

  async obterToken(override = null, produto = "cobrancas") {

    const { clientId, clientSecret, apiURL } = this.obterConfig(override, produto);

    if (!clientId || !clientSecret) {
      throw new Error("Client ID/Secret da EFI não configurados.");
    }

    const agora = Date.now();
    const chaveCache = `${clientId}:${produto}`;
    const cache = this._tokens[chaveCache];

    if (cache && agora < cache.expiraEm) {
      return cache.token;
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {

      const resposta = await axios.post(
        `${apiURL}${CAMINHO_TOKEN[produto] || CAMINHO_TOKEN.cobrancas}`,
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
      this._tokens[chaveCache] = {
        token: resposta.data.access_token,
        expiraEm: agora + ((resposta.data.expires_in || 3600) - 30) * 1000,
      };

      return resposta.data.access_token;

    } catch (error) {

      const mensagem =
        error.response?.data?.error_description ||
        error.response?.data?.mensagem ||
        error.message;

      throw new Error(`Erro ao autenticar na EFI (${produto}): ${mensagem}`);

    }

  }

  async request(method, endpoint, body = null, override = null, produto = "cobrancas") {

    const { apiURL } = this.obterConfig(override, produto);

    if (USAR_MOCK) {
      return { success: true, mock: true, method, endpoint, body };
    }

    const token = await this.obterToken(override, produto);

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

      // error_description às vezes vem como objeto (ex.: erro de
      // validação de campo: { property, message }), não como string --
      // usar ele direto como mensagem de erro faz o Error() virar
      // "[object Object]" lá na frente (alert() no front-end).
      const descricaoErro = dadosErro?.error_description;

      const mensagem =
        dadosErro?.nome && dadosErro?.mensagem
          ? `${dadosErro.nome}: ${dadosErro.mensagem}`
          : dadosErro?.mensagem ||
            (typeof descricaoErro === "string" ? descricaoErro : descricaoErro?.message) ||
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

    // A EFI exige CPF, e-mail e telefone válidos pra registrar o
    // boleto -- cadastro incompleto/errado (inquilino sem e-mail, CPF
    // faltando dígito, etc.) tem que travar aqui com mensagem clara,
    // em vez de chegar a chamar a API e voltar com um erro genérico/
    // código difícil de entender. Força corrigir o cadastro do
    // inquilino antes de reenviar.
    const nome = dados.pagador?.nome || "";
    const cpfDigitos = String(dados.pagador?.cpf || "").replace(/\D/g, "");
    const emailBruto = String(dados.pagador?.email || "").trim();
    const telefoneDigitos = String(dados.pagador?.telefone || "").replace(/\D/g, "");

    const emailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailBruto);

    if (cpfDigitos.length !== 11) {
      throw new Error(`CPF do inquilino ${nome ? `"${nome}" ` : ""}está ausente ou inválido. Corrija o cadastro antes de enviar a cobrança.`);
    }

    if (!emailValido) {
      throw new Error(`E-mail do inquilino ${nome ? `"${nome}" ` : ""}está ausente ou em formato inválido. Corrija o cadastro antes de enviar a cobrança.`);
    }

    if (!telefoneDigitos) {
      throw new Error(`Telefone do inquilino ${nome ? `"${nome}" ` : ""}está ausente. Corrija o cadastro antes de enviar a cobrança.`);
    }

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
            name: nome,
            cpf: cpfDigitos,
            email: emailBruto,
            phone_number: telefoneDigitos,
          },
          expire_at: dados.dataVencimento, // formato AAAA-MM-DD
        },
      },
    }, override);

    // CONFIRMADO ao vivo em 03/11/2026 contra a API real (não é mais
    // palpite) -- a EFI devolve tudo direto em "data", não aninhado
    // em "payment.banking_billet" como eu tinha chutado antes. Nesse
    // teste real: data.barcode = linha digitável, data.pdf.charge =
    // PDF do boleto, data.charge_id = número (veio como Int, por isso
    // o String() abaixo). data.pix.qrcode = Pix Copia e Cola (texto),
    // data.pix.qrcode_image = o mesmo QR em SVG base64 (não usado aqui
    // -- o pagador já consegue pagar por Pix só com o copia e cola).
    const dadosCobranca = resultado?.data || resultado;

    const chargeId = dadosCobranca?.charge_id;

    return {
      numero: chargeId != null ? String(chargeId) : null,
      linhaDigitavel: dadosCobranca?.barcode || null,
      urlImagemBoleto: dadosCobranca?.pdf?.charge || dadosCobranca?.billet_link || null,
      pixCopiaECola: dadosCobranca?.pix?.qrcode || null,
    };

  }

  // ==========================
  // PIX -- extrato de recebidos
  // ==========================
  //
  // Pra contas EFI que não emitem boleto pelo sistema (ex: uma conta
  // só pra receber Pix em paralelo ao banco principal do locador) --
  // soma o que entrou num período, pra mostrar "quanto recebemos no
  // mês" sem precisar lançar nada manual.
  //
  // ATENÇÃO: igual todo o resto desse arquivo -- formato de endpoint e
  // resposta é o melhor palpite a partir da documentação pública da
  // API Pix (padrão comum entre PSPs, baseado no Bacen), NÃO testado
  // ao vivo ainda. Testar em homologação (a EFI tem um simulador de
  // Pix recebido no sandbox) antes de confiar no valor mostrado.
  async listarPixRecebidos({ dataInicio, dataFim }, override = null) {

    const todosOsPix = [];
    let pagina = 0;
    let totalDePaginas = 1;

    while (pagina < totalDePaginas) {

      const resultado = await this.request(
        "GET",
        `/v2/pix?inicio=${encodeURIComponent(dataInicio)}&fim=${encodeURIComponent(dataFim)}` +
          `&paginacao.paginaAtual=${pagina}&paginacao.itensPorPagina=100`,
        null,
        override,
        "pix"
      );

      todosOsPix.push(...(resultado?.pix || []));

      totalDePaginas = resultado?.parametros?.paginacao?.quantidadeDePaginas || 1;
      pagina += 1;

    }

    return {
      quantidade: todosOsPix.length,
      total: todosOsPix.reduce((soma, p) => soma + Number(p.valor || 0), 0),
      pix: todosOsPix,
    };

  }

}

module.exports = new EFIApi();
