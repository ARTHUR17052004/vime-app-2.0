const prisma = require('../config/prisma');

const listar = () => {
  return prisma.inquilino.findMany({
    include: {
      kitnet: {
        include: {
          unidade: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const criar = (dados) => {
  return prisma.inquilino.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.inquilino.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.inquilino.delete({
    where: { id }
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};