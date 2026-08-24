const prisma = require("../config/prisma");
const { getIO } = require("../socket");

/* ==========================================
   CRIAR (usado pelos outros serviços:
   whatsapp, asaas, clicksign, sistema)
========================================== */

const criar = async ({ usuarioId, origem, titulo, mensagem, link }) => {

  const notificacao = await prisma.notificacao.create({
    data: {
      usuarioId: usuarioId || null,
      origem,
      titulo,
      mensagem,
      link: link || null,
    },
  });

  const io = getIO();

  if (io) {
    // Envia em tempo real só pro usuário dono, se especificado
    if (usuarioId) {
      io.to(`usuario:${usuarioId}`).emit("notificacao:nova", notificacao);
    } else {
      io.emit("notificacao:nova", notificacao);
    }
  }

  return notificacao;
};

/* ==========================================
   LISTAR NÃO LIDAS (pro sininho)
========================================== */

const listarNaoLidas = async (usuarioId) => {

  return prisma.notificacao.findMany({
    where: {
      lida: false,
      OR: [
        { usuarioId },
        { usuarioId: null },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

};

/* ==========================================
   LISTAR HISTÓRICO (já lidas)
========================================== */

const listarHistorico = async (usuarioId) => {

  return prisma.notificacao.findMany({
    where: {
      lida: true,
      OR: [
        { usuarioId },
        { usuarioId: null },
      ],
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

const marcarTodasComoLidas = async (usuarioId) => {

  return prisma.notificacao.updateMany({
    where: {
      lida: false,
      OR: [
        { usuarioId },
        { usuarioId: null },
      ],
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