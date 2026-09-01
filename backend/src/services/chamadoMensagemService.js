const prisma = require("../config/prisma");
const notificacaoService = require("./notificacaoService");

const listar = (chamadoId) => {

  return prisma.chamadoMensagem.findMany({
    where: { chamadoId },
    orderBy: { createdAt: "asc" },
  });

};

const criar = async (chamadoId, dados, autor) => {

  const mensagem = await prisma.chamadoMensagem.create({
    data: {
      chamadoId,
      autorId: autor?.id || null,
      autorNome: autor?.nome || "Sistema",
      texto: dados.texto || null,
      statusAlterado: dados.statusAlterado || null,
      anexoNome: dados.anexoNome || null,
      anexoTipo: dados.anexoTipo || null,
      anexoDados: dados.anexoDados || null,
    },
  });

  if (dados.statusAlterado) {

    await prisma.chamado.update({
      where: { id: chamadoId },
      data: { status: dados.statusAlterado },
    });

  }

  const chamado = await prisma.chamado.findUnique({
    where: { id: chamadoId },
  });

  const autorNome = autor?.nome || "Alguém";
  const referencia = chamado
    ? `"${chamado.titulo}" (${chamado.numero})`
    : "um chamado";

  if (dados.statusAlterado) {

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Chamado atualizado",
      mensagem: `${autorNome} marcou ${referencia} como ${dados.statusAlterado}.`,
      link: `/suporte/${chamadoId}`,
    });

  } else {

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Nova resposta em chamado",
      mensagem: `${autorNome} respondeu ${referencia}.`,
      link: `/suporte/${chamadoId}`,
    });

  }

  return mensagem;

};

module.exports = {
  listar,
  criar,
};
