const prisma = require('../config/prisma');

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

const criar = (dados) => {
  return prisma.solicitacao.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.solicitacao.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
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