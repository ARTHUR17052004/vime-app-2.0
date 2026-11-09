const prisma = require("../config/prisma");
const axios = require("axios");
const metaWhatsappService = require("./metaWhatsappService");
const assistenteWhatsappService = require("./assistenteWhatsappService");
const notificacaoService = require("./notificacaoService");
const { getIO } = require("../socket");
const { filtroInquilino } = require("../utils/escopoLocador");
const { doInquilino: locadorDoInquilino } = require("../utils/locadorDeRegistro");
const { paraChave: normalizarTelefoneChave } = require("../utils/telefoneWhatsapp");

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

    const configurado =
      await metaWhatsappService.temCredenciais();

    return {
      conectado: configuracao.conectado,
      configurado,
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

  // Usuário restrito a um locador só vê conversa de contato ligado a
  // inquilino da área dele (contato sem inquilino cadastrado fica de fora).
  async conversas(usuario) {

    const conversas = await prisma.whatsappConversa.findMany({
      where: usuario?.locadorId
        ? { contato: { inquilino: filtroInquilino(usuario) } }
        : {},
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
        numero: conversa.contato.telefone,
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
          mensagemIdMeta: m.mensagemIdMeta,
          tipo: m.tipo,
          texto: m.texto,
          status: m.status,
          erroDetalhe: m.erroDetalhe,
          editada: m.editada,
          respostaDeId: m.respostaDeId,
          // Resolvido aqui (não é relação do Prisma) -- se a mensagem
          // citada já não existir mais (foi apagada), fica undefined e
          // o chat só não mostra a prévia, sem quebrar nada.
          respostaDeTexto: m.respostaDeId
            ? conversa.mensagens.find((outra) => outra.id === m.respostaDeId)?.texto
            : null,
          hora: m.createdAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      };
    });
  }

  /* ==========================================
     RELATÓRIO DE MENSAGENS ENVIADAS
  ========================================== */

  // Só mensagem que A GENTE mandou (tipo "enviada") tem status de
  // entrega rastreado pela Meta -- mensagem recebida do contato não
  // passa por "entregue"/"lida" da nossa parte, então fica de fora.
  async relatorio(usuario, filtros = {}) {

    const { status, dataDe, dataAte, busca } = filtros;

    const filtroContato = {
      // Usuário restrito a um locador só vê mensagem pra contato ligado
      // a inquilino da área dele -- mesma regra de conversas().
      ...(usuario?.locadorId && { inquilino: filtroInquilino(usuario) }),
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { telefone: { contains: busca } },
        ],
      }),
    };

    const whereBase = {
      tipo: "enviada",
      ...((dataDe || dataAte) && {
        createdAt: {
          ...(dataDe && { gte: new Date(dataDe) }),
          ...(dataAte && { lte: new Date(`${dataAte}T23:59:59.999`) }),
        },
      }),
      conversa: { contato: filtroContato },
    };

    // Resumo conta por TODOS os status do período/busca filtrado, sem
    // aplicar o filtro de status -- senão filtrar por "Falhou" sempre
    // mostraria "100% falhou" no resumo, inútil pra comparar.
    const [mensagens, statusBase] = await Promise.all([
      prisma.whatsappMensagem.findMany({
        where: { ...whereBase, ...(status && { status }) },
        include: { conversa: { include: { contato: true } } },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.whatsappMensagem.findMany({
        where: whereBase,
        select: { status: true },
      }),
    ]);

    const resumo = { total: statusBase.length, enviada: 0, entregue: 0, lida: 0, falhou: 0 };

    for (const item of statusBase) {
      // Mensagem antiga de antes do webhook de status existir fica sem
      // "status" nenhum no banco -- conta como "enviada" (só saiu,
      // sem confirmação de entrega registrada).
      const chave = item.status || "enviada";
      if (resumo[chave] !== undefined) resumo[chave] += 1;
    }

    return {
      resumo,
      mensagens: mensagens.map((m) => ({
        id: m.id,
        texto: m.texto,
        status: m.status || "enviada",
        erroDetalhe: m.erroDetalhe,
        enviadaPorIA: m.enviadaPorIA,
        createdAt: m.createdAt,
        conversaId: m.conversaId,
        contato: {
          nome: m.conversa.contato.nome,
          telefone: m.conversa.contato.telefone,
        },
      })),
    };

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
    const configuracao = await this.obterConfiguracao();

    // A chave da IA nunca volta pro navegador -- só um indicador se já
    // tem uma salva, pra não deixar o segredo trafegando/visível à toa.
    return {
      ...configuracao,
      iaApiKey: undefined,
      iaApiKeyConfigurada: !!configuracao.iaApiKey,
    };
  }

  /* ==========================================
     SALVAR CONFIGURAÇÃO
  ========================================== */

  async salvarConfiguracao(dados) {

    const configuracao =
      await this.obterConfiguracao();

    // Espaço em branco colado sem querer (comum ao copiar o Phone Number
    // ID/token do Meta for Developers) quebra a URL da Graph API depois.
    const limpar = (v) => (typeof v === "string" ? v.trim() : v);

    return await prisma.configuracaoWhatsapp.update({
      where: {
        id: configuracao.id,
      },
      data: {
        nomeConexao: limpar(dados.nomeConexao),
        numero: limpar(dados.numero),
        provider: dados.provider,
        webhook: limpar(dados.webhook),
        token: limpar(dados.token),
        phoneNumberId: limpar(dados.phoneNumberId),
        apiUrl: limpar(dados.apiUrl),
        ...(dados.iaAtivo !== undefined ? { iaAtivo: dados.iaAtivo === true } : {}),
        ...(dados.avisosCobrancaAtivos !== undefined ? { avisosCobrancaAtivos: dados.avisosCobrancaAtivos === true } : {}),
        ...(dados.modoSomenteEnvio !== undefined ? { modoSomenteEnvio: dados.modoSomenteEnvio === true } : {}),
        // Só grava a chave da IA se o campo veio preenchido -- assim o
        // formulário pode deixá-la sempre em branco na tela (por
        // segurança) sem apagar a chave já salva a cada "Salvar".
        ...(limpar(dados.iaApiKey) ? { iaApiKey: limpar(dados.iaApiKey) } : {}),
      },
    });
  }

 /* ==========================================
     ENVIAR MENSAGEM

     `dados.conversaId` vem da tela (já tem a conversa aberta) --
     resolve pelo número como alternativa, criando contato/conversa se
     for a primeira vez que mandamos pra esse número. `dados.respostaA`
     (opcional) é o mensagemIdMeta de uma mensagem anterior, pra
     responder citando ela de verdade.
  ========================================== */

  async enviarMensagem(dados) {

    let conversa = dados.conversaId
      ? await prisma.whatsappConversa.findUnique({ where: { id: dados.conversaId } })
      : null;

    if (!conversa) {

      const numero = normalizarTelefoneChave(dados.numero);

      let contato = await prisma.whatsappContato.findUnique({ where: { telefone: numero } });

      if (!contato) {
        contato = await prisma.whatsappContato.create({ data: { telefone: numero, nome: numero } });
      }

      conversa = await prisma.whatsappConversa.findFirst({ where: { contatoId: contato.id } });

      if (!conversa) {
        conversa = await prisma.whatsappConversa.create({ data: { contatoId: contato.id } });
      }

    }

    // Usa a Meta Cloud API quando token + phone number ID estiverem configurados
    // (na tela de Configuração ou via variáveis de ambiente)
    if (await metaWhatsappService.temCredenciais()) {

      const resultado = await metaWhatsappService.enviarMensagem(
        dados.numero,
        dados.mensagem,
        dados.respostaA || null
      );

      const mensagemCriada = await prisma.whatsappMensagem.create({
        data: {
          conversaId: conversa.id,
          texto: dados.mensagem,
          tipo: "enviada",
          status: "enviada",
          mensagemIdMeta: resultado?.messages?.[0]?.id || null,
          respostaDeId: dados.respostaDeId || null,
        },
      });

      await prisma.whatsappConversa.update({
        where: { id: conversa.id },
        data: { ultimaMensagem: dados.mensagem, ultimaData: new Date() },
      });

      const io = getIO();
      if (io) {
        io.emit("whatsapp:update", await this.conversas());
      }

      return { ...resultado, mensagem: mensagemCriada };
    }

    // Sem token configurado: modo mock -- mesmo assim grava no
    // histórico, senão some igual sumia antes (nem em mock dava pra
    // conferir depois o que tinha sido "enviado").
    console.log("Mensagem enviada (MOCK):");
    console.table(dados);

    const mensagemCriada = await prisma.whatsappMensagem.create({
      data: {
        conversaId: conversa.id,
        texto: dados.mensagem,
        tipo: "enviada",
        status: "enviada",
        respostaDeId: dados.respostaDeId || null,
      },
    });

    await prisma.whatsappConversa.update({
      where: { id: conversa.id },
      data: { ultimaMensagem: dados.mensagem, ultimaData: new Date() },
    });

    const io = getIO();
    if (io) {
      io.emit("whatsapp:update", await this.conversas());
    }

    return {
      success: true,
      enviado: true,
      mock: true,
      mensagem: mensagemCriada,
    };
  }

  /* ==========================================
     EXCLUIR CONVERSA

     Apaga a conversa inteira e as mensagens dela -- só o nosso
     histórico, não "desfaz" nada que já foi enviado/recebido de
     verdade pelo WhatsApp. Mantém o WhatsappContato (telefone -->
     inquilino), senão a próxima mensagem desse número perderia o
     vínculo e voltaria a aparecer só com o número cru.
  ========================================== */

  async excluirConversa(id) {

    await prisma.whatsappMensagem.deleteMany({ where: { conversaId: id } });

    await prisma.whatsappConversa.delete({ where: { id } });

    const io = getIO();
    if (io) {
      io.emit("whatsapp:update", await this.conversas());
    }

    return { success: true };

  }

  /* ==========================================
     APAGAR MENSAGEM

     Some só do nosso histórico -- a Meta não tem como "desfazer" a
     entrega de uma mensagem já recebida no aparelho de quem recebeu.
  ========================================== */

  async excluirMensagem(id) {

    const mensagem = await prisma.whatsappMensagem.findUnique({ where: { id } });

    if (!mensagem) {
      return { success: false, mensagem: "Mensagem não encontrada." };
    }

    await prisma.whatsappMensagem.delete({ where: { id } });

    // Se era a última mensagem da conversa, a prévia na lista (lateral
    // esquerda) precisa recuar pra penúltima -- senão ficaria mostrando
    // um texto que não existe mais.
    const ultimaRestante = await prisma.whatsappMensagem.findFirst({
      where: { conversaId: mensagem.conversaId },
      orderBy: { createdAt: "desc" },
    });

    await prisma.whatsappConversa.update({
      where: { id: mensagem.conversaId },
      data: {
        ultimaMensagem: ultimaRestante?.texto || "",
        ultimaData: ultimaRestante?.createdAt || null,
      },
    });

    const io = getIO();
    if (io) {
      io.emit("whatsapp:update", await this.conversas());
    }

    return { success: true };

  }

  /* ==========================================
     EDITAR MENSAGEM

     Corrige só o texto guardado aqui -- igual acima, a Meta não deixa
     editar uma mensagem já entregue de verdade no WhatsApp de quem
     recebeu, então isso NÃO reenvia nada, só conserta o nosso registro
     (ex.: corrigir um valor digitado errado na hora).
  ========================================== */

  async editarMensagem(id, texto) {

    const mensagem = await prisma.whatsappMensagem.update({
      where: { id },
      data: { texto, editada: true },
    });

    const ultima = await prisma.whatsappMensagem.findFirst({
      where: { conversaId: mensagem.conversaId },
      orderBy: { createdAt: "desc" },
    });

    if (ultima?.id === mensagem.id) {
      await prisma.whatsappConversa.update({
        where: { id: mensagem.conversaId },
        data: { ultimaMensagem: texto },
      });
    }

    const io = getIO();
    if (io) {
      io.emit("whatsapp:update", await this.conversas());
    }

    return { success: true, mensagem };

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
     STATUS DE ENTREGA (webhook "statuses" da Meta)

     É isso que dá o "controle se o inquilino recebeu ou não": pra toda
     mensagem que a gente manda (template ou texto livre), a Meta avisa
     aqui quando sai do nosso lado ("sent"), chega no aparelho
     ("delivered"), é lida ("read") ou falha ("failed", com motivo).
     Casa pelo mensagemIdMeta gravado no envio -- mensagem antiga de
     antes dessa função existir não tem esse ID, então fica sem
     atualização (não dá pra casar, mas também não quebra nada).
  ========================================== */

  async processarStatus(statuses) {

    const RANK = { enviada: 1, entregue: 2, lida: 3 };

    for (const item of statuses) {

      const mensagem = await prisma.whatsappMensagem.findFirst({
        where: { mensagemIdMeta: item.id },
        include: { conversa: { include: { contato: { include: { inquilino: true } } } } },
      });

      if (!mensagem) continue;

      const mapa = { sent: "enviada", delivered: "entregue", read: "lida", failed: "falhou" };

      const novoStatus = mapa[item.status];

      if (!novoStatus) continue;

      // Nunca deixa um evento atrasado/fora de ordem voltar o status pra
      // trás (ex: "entregue" chegando depois de "lida" já ter sido
      // processada) -- "falhou" é a única atualização que sempre entra,
      // já que normalmente chega sem um "enviada" antes.
      if (
        novoStatus !== "falhou" &&
        RANK[novoStatus] <= (RANK[mensagem.status] || 0)
      ) {
        continue;
      }

      const erroDetalhe = novoStatus === "falhou" ? (item.errors?.[0]?.title || "Falha não especificada.") : null;

      await prisma.whatsappMensagem.update({
        where: { id: mensagem.id },
        data: { status: novoStatus, erroDetalhe },
      });

      // Essa é a falha mais comum na prática (número sem WhatsApp,
      // bloqueado, política da Meta...) -- o envio em si retornou 200
      // (aceito), só falha de verdade chega depois, por aqui. Sem isso
      // a equipe nunca saberia que o inquilino não recebeu a cobrança.
      if (novoStatus === "falhou") {

        const contato = mensagem.conversa?.contato;

        await notificacaoService.criar({
          origem: "WHATSAPP",
          titulo: `WhatsApp não entregue para ${contato?.nome || contato?.telefone || "inquilino"}`,
          mensagem: `${mensagem.texto}\n\nMotivo: ${erroDetalhe}`,
          // Leva direto pra conversa em vez de só abrir a tela de
          // WhatsApp na primeira da lista -- clicar na notificação
          // precisa cair na conversa certa, não só "ver".
          link: `/whatsapp?conversaId=${mensagem.conversaId}`,
          locadorId: contato?.inquilinoId ? await locadorDoInquilino(contato.inquilinoId) : null,
        });

      }

    }

    const io = getIO();

    if (io) {
      io.emit("whatsapp:update", await this.conversas());
    }

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

      // A Meta manda em dois eventos separados: "messages" (alguém nos
      // escreveu) e "statuses" (confirmação de entrega/leitura/falha de
      // uma mensagem NOSSA) -- tratados aqui dentro do mesmo webhook,
      // mas são independentes (um payload normalmente só tem um dos dois).
      if (changes.statuses?.length > 0) {
        await this.processarStatus(changes.statuses);
      }

      const mensagens = changes.messages || [];

      if (mensagens.length === 0)
        return { success: true };

      // "Modo somente envio": inquilino não interage de volta -- a
      // mensagem dele ainda chega aqui (não tem como travar o botão de
      // responder no aparelho dele, isso é do WhatsApp/Meta), mas o
      // sistema ignora por completo abaixo quando o contato bate com um
      // inquilino cadastrado.
      const { modoSomenteEnvio } = await this.obterConfiguracao();

      for (const msg of mensagens) {

        // msg.from às vezes vem sem o 9º dígito do celular (mesmo
        // quando mandamos PARA o número com o 9) -- normaliza pra
        // chave canônica, senão a mesma pessoa vira dois contatos.
        const numero = normalizarTelefoneChave(msg.from);

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

          // Tenta casar esse número com um inquilino cadastrado (pelos
          // últimos 8 dígitos, pra não depender do 9º dígito/DDI batendo
          // igual) -- assim a conversa já nasce com o nome certo em vez
          // do número cru, mesmo quando quem manda a 1ª mensagem é o
          // inquilino (não a gente).
          const sufixo = numero.slice(-8);

          const inquilinos = await prisma.inquilino.findMany({
            select: { id: true, nome: true, telefone: true },
          });

          const inquilinoEncontrado = inquilinos.find((i) => {
            const digitos = (i.telefone || "").replace(/\D/g, "");
            return digitos && digitos.slice(-8) === sufixo;
          });

          contato =
            await prisma.whatsappContato.create({
              data: {
                telefone: numero,
                nome: inquilinoEncontrado?.nome || numero,
                inquilinoId: inquilinoEncontrado?.id || null,
              },
            });
        }

        // Contato que não é inquilino (candidato, número errado, etc.)
        // continua conversando normal -- o bloqueio é só pro inquilino.
        if (modoSomenteEnvio && contato.inquilinoId) {
          continue;
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

        // O WhatsApp é onde a equipe efetivamente responde o inquilino --
        // toda mensagem recebida precisa aparecer no sino de notificações
        // pra alguém saber que precisa responder, mesmo se o assistente
        // de IA também responder automaticamente logo abaixo.
        await notificacaoService.criar({
          origem: "WHATSAPP",
          titulo: `Nova mensagem de ${contato.nome || numero}`,
          mensagem: texto,
          // Mesma lógica: cai direto na conversa de quem mandou,
          // não só na tela de WhatsApp genérica.
          link: `/whatsapp?conversaId=${conversa.id}`,
          locadorId: contato.inquilinoId ? await locadorDoInquilino(contato.inquilinoId) : null,
        });

        // Assistente IA: só responde automaticamente se estiver ativado
        // e o número bater com um inquilino cadastrado. Erros aqui não
        // devem derrubar o webhook — a mensagem já foi salva de
        // qualquer forma, um humano consegue responder pela tela normal.
        try {

          const respostaIA = await assistenteWhatsappService.processarMensagemRecebida({
            numeroWhatsapp: numero,
            textoMensagem: texto,
          });

          if (respostaIA) {

            await metaWhatsappService.enviarMensagem(numero, respostaIA);

            await prisma.whatsappMensagem.create({
              data: {
                conversaId: conversa.id,
                texto: respostaIA,
                tipo: "enviada",
                status: "enviada",
              },
            });

            await prisma.whatsappConversa.update({
              where: { id: conversa.id },
              data: {
                ultimaMensagem: respostaIA,
                ultimaData: new Date(),
              },
            });

          }

        } catch (erroIA) {

          console.error("Erro ao gerar resposta do assistente IA:", erroIA.message);

        }
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