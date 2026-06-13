const prisma = require('../config/prisma');

const listar = () => {
  return prisma.locador.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const criar = (dados) => {
  return prisma.locador.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.locador.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.locador.delete({
    where: { id }
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};