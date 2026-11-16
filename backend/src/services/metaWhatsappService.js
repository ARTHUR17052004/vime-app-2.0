const axios = require("axios");
const prisma = require("../config/prisma");
const { paraEnvio: normalizarNumero } = require("../utils/telefoneWhatsapp");

class MetaWhatsappService {

  async obterCredenciais() {

    const configuracao =
      await prisma.configuracaoWhatsapp.findFirst();

    return {
      phoneId:
        configuracao?.phoneNumberId ||
        process.env.WHATSAPP_PHONE_NUMBER_ID,

      token:
        configuracao?.token ||
        process.env.WHATSAPP_ACCESS_TOKEN,
    };

  }

  async temCredenciais() {

    const { phoneId, token } = await this.obterCredenciais();

    return Boolean(phoneId && token);

  }

  async request(endpoint, body) {

    const { phoneId, token } = await this.obterCredenciais();

    if (!phoneId || !token) {
      throw new Error(
        "WhatsApp não configurado: informe o Token e o Phone Number ID na tela de Configuração."
      );
    }

    try {

      const response = await axios({
        method: "POST",
        url: `https://graph.facebook.com/v23.0/${phoneId}${endpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: body,
      });

      return response.data;

    } catch (error) {

      console.error("Erro Meta WhatsApp:");

      if (error.response) {

        console.error(error.response.data);

        throw new Error(
          error.response.data?.error?.message ||
          "Erro ao comunicar com a Meta Cloud API."
        );

      }

      throw new Error(
        error.message || "Erro desconhecido na Meta Cloud API."
      );

    }

  }

  // Baixa o conteúdo de uma mídia RECEBIDA (imagem/áudio/vídeo/
  // documento/figurinha) -- a Meta nunca manda o arquivo direto no
  // webhook, só o id. Dois passos: 1) GET /{media-id} devolve uma URL
  // temporária (expira rápido, por isso baixa na hora, nunca guarda
  // essa URL) + o mime_type de verdade; 2) GET nessa URL (com o mesmo
  // Bearer token) devolve os bytes. Sem isso, toda mídia recebida virava
  // só "[Mensagem não suportada]" e o conteúdo se perdia pra sempre.
  async obterMidia(mediaId) {

    const { token } = await this.obterCredenciais();

    if (!token) {
      throw new Error("WhatsApp não configurado: informe o Token na tela de Configuração.");
    }

    const info = await axios.get(`https://graph.facebook.com/v23.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const resposta = await axios.get(info.data.url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    });

    return {
      buffer: Buffer.from(resposta.data),
      mimeType: info.data.mime_type || "application/octet-stream",
    };

  }

  // `respostaAId` (opcional) é o wamid (mensagemIdMeta) de uma mensagem
  // anterior -- quando informado, a Meta manda como resposta "citada"
  // de verdade (igual responder uma mensagem específica no WhatsApp
  // normal), não só um texto novo solto na conversa.
  async enviarMensagem(numero, mensagem, respostaAId = null) {

    return await this.request(

      "/messages",

      {

        messaging_product: "whatsapp",

        to: normalizarNumero(numero),

        type: "text",

        text: {

          body: mensagem,

        },

        ...(respostaAId ? { context: { message_id: respostaAId } } : {}),

      }

    );

  }

  /* ==========================================
     ENVIAR DOCUMENTO (mensagem livre, sem modelo)

     Só funciona dentro da janela de 24h depois do cliente escrever
     pra gente (mesma regra da mensagem de texto livre). Usado como
     alternativa quando um modelo ainda não foi aprovado pela Meta --
     assim que o modelo aprovar, o caminho oficial (enviarTemplate)
     volta a ser usado sozinho.
  ========================================== */

  async enviarDocumento(numero, url, legenda, filename = "boleto.pdf") {

    return await this.request(

      "/messages",

      {

        messaging_product: "whatsapp",

        to: normalizarNumero(numero),

        type: "document",

        document: {
          link: url,
          filename,
          caption: legenda,
        },

      }

    );

  }

  /* ==========================================
     ENVIAR MODELO (TEMPLATE)

     Mensagens automáticas (cobrança nova, lembrete, atraso, pagamento
     confirmado) só podem ser iniciadas pela empresa usando um modelo
     pré-aprovado pela Meta -- mensagem de texto livre (enviarMensagem
     acima) só funciona dentro da janela de 24h depois do cliente
     escrever pra gente. `parametrosCorpo` preenche as variáveis
     {{1}}, {{2}}... do corpo do modelo, na ordem. `documentoUrl`,
     quando informado, preenche o cabeçalho de documento do modelo com
     um link público (ex: o PDF do boleto) -- só funciona em modelos
     que tenham cabeçalho do tipo Documento.
  ========================================== */

  async enviarTemplate(numero, nomeModelo, parametrosCorpo = [], documentoUrl = null) {

    const components = [];

    if (documentoUrl) {
      components.push({
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              link: documentoUrl,
              filename: "boleto.pdf",
            },
          },
        ],
      });
    }

    if (parametrosCorpo.length > 0) {
      components.push({
        type: "body",
        parameters: parametrosCorpo.map((valor) => ({
          type: "text",
          text: String(valor ?? ""),
        })),
      });
    }

    return await this.request(

      "/messages",

      {

        messaging_product: "whatsapp",

        to: normalizarNumero(numero),

        type: "template",

        template: {
          name: nomeModelo,
          language: { code: "pt_BR" },
          components,
        },

      }

    );

  }

  async webhook(dados) {

    console.log("Webhook Meta:");

    console.dir(dados, {

      depth: null,

    });

    return {

      success: true,

    };

  }

}

module.exports = new MetaWhatsappService();
