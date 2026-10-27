const prisma = require("../config/prisma");

/*
  Histórico de conversas do "Pergunte ao VIME" -- cada usuário só vê e
  mexe nas próprias conversas (sem escopo por locador aqui, é dado
  pessoal de uso, não dado operacional do sistema).
*/

// Só as últimas N mensagens entram no prompt a cada pergunta nova --
// controla custo/tamanho sem perder o contexto recente da conversa.
const LIMITE_HISTORICO_MENSAGENS = 20;
const LIMITE_TITULO = 60;

function gerarTitulo(mensagem) {
  const limpa = mensagem.trim().replace(/\s+/g, " ");
  return limpa.length > LIMITE_TITULO ? `${limpa.slice(0, LIMITE_TITULO)}...` : limpa;
}

async function listarConversas(usuario, { busca } = {}) {

  return prisma.sabadoConversa.findMany({
    where: {
      usuarioId: usuario.id,
      ...(busca ? { titulo: { contains: busca, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, titulo: true, updatedAt: true, createdAt: true },
  });

}

async function buscarConversa(usuario, id) {

  const conversa = await prisma.sabadoConversa.findFirst({
    where: { id, usuarioId: usuario.id },
    include: { mensagens: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversa) throw new Error("Conversa não encontrada.");

  return conversa;

}

async function obterOuCriarConversa(usuario, conversaId, primeiraMensagem) {

  if (conversaId) {

    const existente = await prisma.sabadoConversa.findFirst({
      where: { id: conversaId, usuarioId: usuario.id },
    });

    if (!existente) throw new Error("Conversa não encontrada.");

    return existente;

  }

  return prisma.sabadoConversa.create({
    data: { usuarioId: usuario.id, titulo: gerarTitulo(primeiraMensagem) },
  });

}

// Devolve em ordem cronológica (mais antiga primeiro) -- mas limitando
// às N mais RECENTES, por isso busca decrescente e inverte depois.
async function mensagensDaConversa(conversaId) {

  const mensagens = await prisma.sabadoMensagem.findMany({
    where: { conversaId },
    orderBy: { createdAt: "desc" },
    take: LIMITE_HISTORICO_MENSAGENS,
  });

  return mensagens.reverse();

}

async function salvarMensagem(conversaId, role, conteudo) {

  await prisma.$transaction([
    prisma.sabadoMensagem.create({ data: { conversaId, role, conteudo } }),
    prisma.sabadoConversa.update({ where: { id: conversaId }, data: { updatedAt: new Date() } }),
  ]);

}

async function excluirConversa(usuario, id) {

  const resultado = await prisma.sabadoConversa.deleteMany({
    where: { id, usuarioId: usuario.id },
  });

  if (resultado.count === 0) throw new Error("Conversa não encontrada.");

}

module.exports = {
  listarConversas,
  buscarConversa,
  obterOuCriarConversa,
  mensagensDaConversa,
  salvarMensagem,
  excluirConversa,
};
