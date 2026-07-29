const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');

const listar = () => {
  return prisma.solicitacao.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.solicitacao.findUnique({
    where: { id }
  });
};

const criar = async (dados) => {

  const solicitacao = await prisma.solicitacao.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: solicitacao
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    acao: "CRIAR",
    descricao: `Solicitação ${solicitacao.id} criada.`
  });

  return solicitacao;

};

const atualizar = async (id, dados) => {

  const anterior = await prisma.solicitacao.findUnique({
    where: { id }
  });

  const solicitacao = await prisma.solicitacao.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: solicitacao
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    acao: "ATUALIZAR",
    descricao: `Solicitação ${solicitacao.id} atualizada.`
  });

  return solicitacao;

};

const remover = async (id) => {

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id }
  });

  if (!solicitacao) {
    throw new Error("Solicitação não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "EXCLUIR",
    valorAnterior: solicitacao,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    acao: "EXCLUIR",
    descricao: `Solicitação ${solicitacao.id} excluída.`
  });

  return prisma.solicitacao.delete({
    where: { id }
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};