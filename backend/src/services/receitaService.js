const prisma = require('../config/prisma');

const listar = () => {
  return prisma.receita.findMany({
    include: {
      contrato: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.receita.findUnique({
    where: { id },
    include: {
      contrato: true
    }
  });
};

const criar = (dados) => {
  return prisma.receita.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.receita.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.receita.delete({
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