const prisma = require('../config/prisma');

const listar = () => {
  return prisma.despesa.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.despesa.findUnique({
    where: { id }
  });
};

const criar = (dados) => {
  return prisma.despesa.create({
    data: dados
  });
};

const atualizar = (id, dados) => {
  return prisma.despesa.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.despesa.delete({
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