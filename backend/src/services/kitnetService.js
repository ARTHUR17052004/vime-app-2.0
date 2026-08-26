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

  if (!unidade) {
    throw new Error('Residência não encontrada.');
  }

  // unidade.kitnets é o limite cadastrado pra essa residência -- sem
  // limite definido (null/0), não há teto a aplicar aqui.
  if (unidade.kitnets) {

    const existentes = await prisma.kitnet.count({
      where: { unidadeId: dados.unidadeId }
    });

    if (existentes >= unidade.kitnets) {
      throw new Error(
        `Não é possível criar uma kitnet fora do limite da residência: "${unidade.nome}" já tem ${existentes} de ${unidade.kitnets} kitnet(s) cadastradas. Para adicionar mais, aumente a "Quantidade de Kitnets" em Residências.`
      );
    }

  }

  return prisma.kitnet.create({
    data: dados
  });

};

const atualizar = async (id, dados) => {

  await campoObrigatorioService.validar('kitnet', dados);

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