const prisma = require("../config/prisma");
const axios = require("axios");
const metaWhatsappService = require("./metaWhatsappService");
const { getIO } = require("../socket");

const USAR_MOCK =
  process.env.WHATSAPP_MOCK === "true";

class WhatsappService {

  constructor() {
    this.baseURL =
      process.env.WHATSAPP_API_URL || "";

    this.token =
      process.env.WHATSAPP_API_TOKEN || "";
  }

  /* ==========================================
     BUSCAR CONFIGURAÇÃO
  ========================================== */

  async obterConfiguracao() {

    let configuracao =
      await prisma.configuracaoWhatsapp.findFirst();

    if (!configuracao) {

      configuracao =
        await prisma.configuracaoWhatsapp.create({
          data: {
            nomeConexao: "VIME 2.0",
            provider: "META",
            conectado: false,
          },
        });

    }

    return configuracao;
  }

  /* ==========================================
     CONECTAR
  ========================================== */

  async conectar() {

    const configuracao =
      await this.obterConfiguracao();

    return await prisma.configuracaoWhatsapp.update({
      where: {
        id: configuracao.id,
      },
      data: {
        conectado: true,
        ultimaSincronizacao: new Date(),
      },
    });
  }

  async request(endpoint, body) {

    if (USAR_MOCK || !this.token) {
      return {
        success: true,
        mock: true,
        endpoint,
        body
      };
    }

    try {

      const response = await axios({
        method: "POST",
        url: `${this.baseURL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        data: body
      });

      return response.data;

    } catch (error) {

      console.error("Erro WhatsApp:");

      if (error.response) {
        console.error(error.response.data);
        throw new Error(
          error.response.data.error?.message ||
          "Erro ao comunicar com o WhatsApp."
        );
      }

      throw new Error(
        error.message || "Erro desconhecido no WhatsApp."
      );
    }
  }

  /* ==========================================
     GERAR QR CODE
  ========================================== */

  async gerarQrCode() {

    const configuracao =
      await this.conectar();

    const qrCode =
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VIME-WHATSAPP";

    const atualizado =
      await prisma.configuracaoWhatsapp.update({
        where: {
          id: configuracao.id,
        },
        data: {
          qrCode,
          ultimaSincronizacao: new Date(),
        },
      });

    return atualizado;
  }

  /* ==========================================
     STATUS
  ========================================== */

  async status() {

    const configuracao =
      await this.obterConfiguracao();

    return {
      conectado: configuracao.conectado,
      provider: configuracao.provider,
      nomeConexao: configuracao.nomeConexao,
      numero: configuracao.numero,
      webhook: configuracao.webhook,
      qrCode: configuracao.qrCode,
      ultimaSincronizacao: configuracao.ultimaSincronizacao,
      mock: USAR_MOCK,
      conversas: []
    };
  }

  /* ==========================================
     CONVERSAS
  ========================================== */

  async conversas() {

    const conversas = await prisma.whatsappConversa.findMany({
      include: {
        contato: true,
        mensagens: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return conversas.map((conversa) => {

      const ultima =
        conversa.mensagens[conversa.mensagens.length - 1];

      return {
        id: conversa.id,
        nome: conversa.contato.nome,
        numero: conversa.contato.numero,
        online: conversa.contato.online,
        naoLidas: conversa.naoLidas,
        ultimaMensagem: ultima?.texto || "",
        horario: ultima
          ? ultima.createdAt.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        mensagens: conversa.mensagens.map((m) => ({
          id: m.id,
          tipo: m.tipo,
          texto: m.texto,
          hora: m.createdAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      };
    });
  }

  /* ==========================================
     SINCRONIZAR
  ========================================== */

  async sincronizar() {

    const configuracao =
      await prisma.configuracaoWhatsapp.findFirst();

    if (configuracao) {
      await prisma.configuracaoWhatsapp.update({
        where: {
          id: configuracao.id,
        },
        data: {
          ultimaSincronizacao: new Date(),
        },
      });
    }

    return await this.conversas();
  }

  /* ==========================================
     CONFIGURAÇÃO
  ========================================== */

  async configuracao() {
    return await this.obterConfiguracao();
  }

  /* ==========================================
     SALVAR CONFIGURAÇÃO
  ========================================== */

  async salvarConfiguracao(dados) {

    const configuracao =
      await this.obterConfiguracao();

    return await prisma.configuracaoWhatsapp.update({
      where: {
        id: configuracao.id,
      },
      data: {
        nomeConexao: dados.nomeConexao,
        numero: dados.numero,
        provider: dados.provider,
        webhook: dados.webhook,
        token: dados.token,
        apiUrl: dados.apiUrl,
      },
    });
  }

 /* ==========================================
     ENVIAR MENSAGEM
  ========================================== */

  async enviarMensagem(dados) {

    // Usa a Meta Cloud API quando o token estiver configurado
    if (process.env.WHATSAPP_ACCESS_TOKEN) {

      const resultado = await metaWhatsappService.enviarMensagem(
        dados.numero,
        dados.mensagem
      );

      const io = getIO();
      if (io) {
        io.emit("whatsapp:update", await this.conversas());
      }

      return resultado;
    }

    // Sem token configurado: modo mock
    console.log("Mensagem enviada (MOCK):");
    console.table(dados);

    return {
      success: true,
      enviado: true,
      mock: true,
      mensagem: dados,
    };
  }
  /* ==========================================
     RECEBER MENSAGEM
  ========================================== */

  async receberMensagem(dados) {
    return {
      success: true,
      recebido: dados,
    };
  }

  /* ==========================================
     WEBHOOK
  ========================================== */

  async webhook(body) {

    try {

      const changes =
        body?.entry?.[0]?.changes?.[0]?.value;

      if (!changes)
        return { success: true };

      const mensagens = changes.messages || [];

      if (mensagens.length === 0)
        return { success: true };

      for (const msg of mensagens) {

        const numero = msg.from;

        const texto =
          msg.text?.body ||
          "[Mensagem não suportada]";

        let contato =
          await prisma.whatsappContato.findUnique({
            where: {
              telefone: numero,
            },
          });

        if (!contato) {
          contato =
            await prisma.whatsappContato.create({
              data: {
                telefone: numero,
                nome: numero,
              },
            });
        }

        let conversa =
          await prisma.whatsappConversa.findFirst({
            where: {
              contatoId: contato.id,
            },
          });

        if (!conversa) {
          conversa =
            await prisma.whatsappConversa.create({
              data: {
                contatoId: contato.id,
              },
            });
        }

        await prisma.whatsappMensagem.create({
          data: {
            conversaId: conversa.id,
            mensagemIdMeta: msg.id,
            texto,
            tipo: "recebida",
            status: "recebida",
          },
        });

        await prisma.whatsappConversa.update({
          where: {
            id: conversa.id,
          },
          data: {
            ultimaMensagem: texto,
            ultimaData: new Date(),
            naoLidas: {
              increment: 1,
            },
          },
        });
      }

      const io = getIO();

      if (io) {
        io.emit(
          "whatsapp:update",
          await this.conversas()
        );
      }

      return {
        success: true,
      };

    } catch (error) {

      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  }

}

module.exports = new WhatsappService();