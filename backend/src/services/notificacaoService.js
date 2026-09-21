const prisma = require("../config/prisma");
const { getIO } = require("../socket");
const pushService = require("./pushService");
const notificacaoConfigService = require("./notificacaoConfigService");
const { tipoDe } = require("../utils/tiposNotificacao");
const { doLink } = require("../utils/locadorDeRegistro");

// Quem enxerga o quê:
//  - usuário que vê o sistema inteiro (sem locador): tudo, como sempre;
//  - usuário restrito a um locador: só o que é pra ele (usuarioId dele) ou
//    aviso geral marcado com o locador dele -- nunca aviso de outro
//    locador nem aviso sem locador conhecido.
const filtroVisivel = (usuarioId, locadorId) =>
  locadorId
    ? { OR: [{ usuarioId }, { usuarioId: null, locadorId }] }
    : { OR: [{ usuarioId }, { usuarioId: null }] };

/* ==========================================
   CRIAR (usado pelos outros serviços:
   whatsapp, asaas, clicksign, sistema)
========================================== */

// `locadorId`: de qual locador é o assunto. Se quem chama não informar,
// descobre pelo link ("/kitnets/<id>", "/contratos/<id>"...). undefined =
// descobrir; null = sem locador (só quem vê tudo recebe).
const criar = async ({ usuarioId, origem, titulo, mensagem, link, locadorId }) => {

  // O admin escolhe o que notificar (Administração > Notificações).
  // Desligado = nem cria. Tipo sem configuração continua ligado.
  const config = await notificacaoConfigService.obter(tipoDe({ origem, titulo }));

  if (!config.ativo) return null;

  if (locadorId === undefined) locadorId = await doLink(link);

  const notificacao = await prisma.notificacao.create({
    data: {
      usuarioId: usuarioId || null,
      origem,
      titulo,
      mensagem,
      link: link || null,
      locadorId: locadorId || null,
    },
  });

  const io = getIO();

  if (io) {

    if (usuarioId) {

      // Em tempo real só pro usuário dono, se especificado
      io.to(`usuario:${usuarioId}`).emit("notificacao:nova", notificacao);

    } else {

      // Aviso geral: só quem vê tudo + os usuários daquele locador (nunca
      // socket sem login nem usuário de outro locador).
      let destino = io.to("irrestritos");
      if (locadorId) destino = destino.to(`locador:${locadorId}`);
      destino.emit("notificacao:nova", notificacao);

    }

  }

  // Notificação de verdade no celular (funciona até com o app
  // fechado) -- só pra quem já ativou isso no aparelho dele (ver
  // pushService.js). Nunca deve derrubar a criação da notificação em
  // si, então qualquer falha aqui só fica no log.
  const payloadPush = {
    title: titulo,
    body: mensagem,
    url: link || "/",
  };

  if (config.push) Promise.resolve(
    usuarioId
      ? pushService.enviarPara(usuarioId, payloadPush)
      : pushService.enviarParaTodos(payloadPush, locadorId || null)
  ).catch((erro) => console.error("[push] Falha ao notificar:", erro.message));

  return notificacao;
};

/* ==========================================
   LISTAR NÃO LIDAS (pro sininho)
========================================== */

const listarNaoLidas = async (usuarioId, locadorId) => {

  return prisma.notificacao.findMany({
    where: {
      lida: false,
      ...filtroVisivel(usuarioId, locadorId),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

};

/* ==========================================
   LISTAR HISTÓRICO (já lidas)
========================================== */

const listarHistorico = async (usuarioId, locadorId) => {

  return prisma.notificacao.findMany({
    where: {
      lida: true,
      ...filtroVisivel(usuarioId, locadorId),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

};

/* ==========================================
   MARCAR COMO LIDA
========================================== */

const marcarComoLida = async (id) => {

  return prisma.notificacao.update({
    where: { id },
    data: {
      lida: true,
      lidaEm: new Date(),
    },
  });

};

/* ==========================================
   MARCAR TODAS COMO LIDAS
========================================== */

const marcarTodasComoLidas = async (usuarioId, locadorId) => {

  return prisma.notificacao.updateMany({
    where: {
      lida: false,
      ...filtroVisivel(usuarioId, locadorId),
    },
    data: {
      lida: true,
      lidaEm: new Date(),
    },
  });

};

module.exports = {
  criar,
  listarNaoLidas,
  listarHistorico,
  marcarComoLida,
  marcarTodasComoLidas,
};
