const prisma = require('../config/prisma');

const listar = () => {
  return prisma.unidade.findMany({
    include: {
      locadorRel: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.unidade.findUnique({
    where: { id },
    include: {
      locadorRel: true
    }
  });
};

const criar = (dados) => {
  return prisma.unidade.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.unidade.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.unidade.delete({
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