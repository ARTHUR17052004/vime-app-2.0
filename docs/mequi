const prisma = require("../config/prisma");
const axios = require("axios");
const metaWhatsappService = require("./metaWhatsappService");
const { getIO } = require("../socket");

const USAR_MOCK =
  process.env.WHATSAPP_MOCK === "true";

let conversasMock = [

  {
    id: 1,
    nome: "Maria Oliveira",
    numero: "+55 11 99999-1111",
    ultimaMensagem: "Bom dia, gostaria de informações.",
    horario: "09:12",
    naoLidas: 2,
    online: true,

    mensagens: [
      {
        id: 1,
        tipo: "recebida",
        texto: "Bom dia, gostaria de informações.",
        hora: "09:10",
      },
      {
        id: 2,
        tipo: "enviada",
        texto: "Bom dia! Claro, como posso ajudar?",
        hora: "09:11",
      },
      {
        id: 3,
        tipo: "recebida",
        texto: "Tenho interesse em uma kitnet.",
        hora: "09:12",
      }
    ]
  },

  {
    id: 2,
    nome: "João Pedro",
    numero: "+55 11 98888-2222",
    ultimaMensagem: "Obrigado pelo atendimento.",
    horario: "Ontem",
    naoLidas: 0,
    online: false,

    mensagens: [
      {
        id: 1,
        tipo: "recebida",
        texto: "Muito obrigado pelo atendimento.",
        hora: "18:10",
      },
      {
        id: 2,
        tipo: "enviada",
        texto: "Nós agradecemos o contato!",
        hora: "18:11",
      }
    ]
  },

  {
    id: 3,
    nome: "Carlos Henrique",
    numero: "+55 11 97777-3333",
    ultimaMensagem: "Quando vence meu aluguel?",
    horario: "08:45",
    naoLidas: 1,
    online: true,

    mensagens: [
      {
        id: 1,
        tipo: "recebida",
        texto: "Quando vence meu aluguel?",
        hora: "08:45",
      }
    ]
  }

];

class WhatsappService {

  /* ==========================================
   CONECTAR
========================================== */

async conectar() {

  let configuracao =
    await prisma.configuracaoWhatsapp.findFirst();

  if (!configuracao) {

    configuracao =
      await prisma.configuracaoWhatsapp.create({

        data: {

          nomeConexao: "VIME 2.0",

          provider: "META",

          conectado: true,

          ultimaSincronizacao: new Date(),

        },

      });

  } else {

    configuracao =
      await prisma.configuracaoWhatsapp.update({

        where: {

          id: configuracao.id,

        },

        data: {

          conectado: true,

          ultimaSincronizacao: new Date(),

        },

      });

  }

  return configuracao;

}

  constructor() {

    this.baseURL =
      process.env.WHATSAPP_API_URL || "";

    this.token =
      process.env.WHATSAPP_API_TOKEN || "";

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

 async status() {

  const configuracao = await prisma.configuracaoWhatsapp.findFirst();

  if (!configuracao) {

    return {

      conectado: !!this.token,

      mock: USAR_MOCK,

      provider: "META",

      nomeConexao: "VIME 2.0",

      numero: null,

      webhook: null,

      qrCode: null,

      ultimaSincronizacao: null,

      conversas: []

    };

  }

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
   SALVAR CONFIGURAÇÃO
========================================== */

async salvarConfiguracao(dados) {

  let configuracao =
    await prisma.configuracaoWhatsapp.findFirst();

  if (!configuracao) {

    configuracao =
      await prisma.configuracaoWhatsapp.create({

        data: dados,

      });

  } else {

    configuracao =
      await prisma.configuracaoWhatsapp.update({

        where: {

          id: configuracao.id,

        },

        data: dados,

      });

  }

  return configuracao;

}

/* ==========================================
   ENVIAR MENSAGEM
========================================== */

async enviarMensagem(dados) {

  const conversa = conversasMock.find(

    (c) => c.numero === dados.numero

  );

  if (conversa) {

    const hora = new Date().toLocaleTimeString(

      "pt-BR",

      {

        hour: "2-digit",

        minute: "2-digit",

      }

    );

    conversa.mensagens.push({

      id: Date.now(),

      tipo: "enviada",

      texto: dados.mensagem,

      hora,

    });

    conversa.ultimaMensagem = dados.mensagem;

    conversa.horario = hora;

    conversa.naoLidas = 0;

    const io = getIO();

if (io) {
  io.emit("whatsapp:update", conversasMock);
}

  }

  // Usa Meta Cloud API quando configurada

  if (process.env.WHATSAPP_ACCESS_TOKEN) {

    return await metaWhatsappService.enviarMensagem(

      dados.numero,

      dados.mensagem

    );

  }

  // Continua usando Mock

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

}module.exports = new WhatsappService();