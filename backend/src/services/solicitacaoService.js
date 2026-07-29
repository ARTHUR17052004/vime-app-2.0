const prisma = require('../config/prisma');
const logService = require('./logService');

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

  const solicitacao = await prisma.solicitacao.update({
    where: { id },
    data: dados
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