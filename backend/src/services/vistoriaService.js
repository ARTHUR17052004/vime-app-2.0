const prisma = require('../config/prisma');

const listar = () => {
  return prisma.vistoria.findMany({
    include: {
      ocorrencias: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.vistoria.findUnique({
    where: { id },
    include: {
      ocorrencias: true
    }
  });
};

const criar = (dados) => {
  return prisma.vistoria.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.vistoria.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.vistoria.delete({
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