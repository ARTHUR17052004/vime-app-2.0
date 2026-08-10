const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const listar = async () => {
  return prisma.configuracao.findMany({
    orderBy: {
      id: "asc",
    },
  });
};

const buscarPorId = async (id) => {
  return prisma.configuracao.findUnique({
    where: {
      id: Number(id),
    },
  });
};

const criar = async (dados) => {
  return prisma.configuracao.create({
    data: dados,
  });
};

const atualizar = async (id, dados) => {
  return prisma.configuracao.update({
    where: {
      id: Number(id),
    },
    data: dados,
  });
};

const excluir = async (id) => {
  return prisma.configuracao.delete({
    where: {
      id: Number(id),
    },
  });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
};