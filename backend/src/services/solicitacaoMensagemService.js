const prisma = require("../config/prisma");
const notificacaoService = require("./notificacaoService");

const listar = (solicitacaoId) => {

  return prisma.solicitacaoMensagem.findMany({
    where: { solicitacaoId },
    orderBy: { createdAt: "asc" },
  });

};

const criar = async (solicitacaoId, dados, autor) => {

  const mensagem = await prisma.solicitacaoMensagem.create({
    data: {
      solicitacaoId,
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

    await prisma.solicitacao.update({
      where: { id: solicitacaoId },
      data: { status: dados.statusAlterado },
    });

  }

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id: solicitacaoId },
  });

  const autorNome = autor?.nome || "Alguém";
  const referencia = solicitacao
    ? `"${solicitacao.titulo}" (${solicitacao.numero})`
    : "uma solicitação";

  if (dados.statusAlterado) {

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Solicitação classificada",
      mensagem: `${autorNome} classificou ${referencia} como ${dados.statusAlterado}.`,
      link: `/solicitacoes/${solicitacaoId}`,
    });

  } else {

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Nova resposta em solicitação",
      mensagem: `${autorNome} respondeu ${referencia}.`,
      link: `/solicitacoes/${solicitacaoId}`,
    });

  }

  return mensagem;

};

module.exports = {
  listar,
  criar,
};
