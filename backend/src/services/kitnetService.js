const prisma = require('../config/prisma');
const campoObrigatorioService = require('./campoObrigatorioService');

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

const criar = async (dados) => {

  await campoObrigatorioService.validar('kitnet', dados);

  const unidade = await prisma.unidade.findUnique({
    where: { id: dados.unidadeId }
  });

  if (unidade) {

    const existentes = await prisma.kitnet.count({
      where: { unidadeId: dados.unidadeId }
    });

    if (existentes >= unidade.kitnets) {
      throw new Error(
        `Esta residência já tem o limite de ${unidade.kitnets} kitnet(s) cadastrado(s). Aumente a quantidade em Residências para adicionar mais.`
      );
    }

  }

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