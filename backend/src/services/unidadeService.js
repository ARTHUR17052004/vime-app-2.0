const prisma = require('../config/prisma');

const sanitizar = (dados) => {

  if (dados.kitnets !== undefined && dados.kitnets !== "") {
    dados.kitnets = parseInt(dados.kitnets, 10) || 0;
  }

  if (dados.aluguel !== undefined && dados.aluguel !== "") {
    dados.aluguel = Number(dados.aluguel);
  } else {
    dados.aluguel = null;
  }

  if (dados.vencimento !== undefined && dados.vencimento !== "") {
    dados.vencimento = parseInt(dados.vencimento, 10);
  } else {
    dados.vencimento = null;
  }

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.locadorRel;
  delete dados.contratos;
  delete dados.kitnetsRelacionadas;

  return dados;

};

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
    data: sanitizar(dados)
  });
};

const atualizar = (id, dados) => {
  return prisma.unidade.update({
    where: { id },
    data: sanitizar(dados)
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
