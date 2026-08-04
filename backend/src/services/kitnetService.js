const prisma = require('../config/prisma');

const listar = () => {
  return prisma.kitnet.findMany({
    include: {
      unidade: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.kitnet.findUnique({
    where: { id },
    include: {
      unidade: true
    }
  });
};

const criar = (dados) => {

  console.log(dados);

  return prisma.kitnet.create({
    data: dados
  });

};

const atualizar = (id, dados) => {
  return prisma.kitnet.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.kitnet.delete({
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