const prisma = require('../config/prisma');

const sanitizar = (dados) => {

  if (dados.dataNascimento) dados.dataNascimento = new Date(dados.dataNascimento);
  if (dados.dataInicioContrato) dados.dataInicioContrato = new Date(dados.dataInicioContrato);
  if (dados.dataFimContrato) dados.dataFimContrato = new Date(dados.dataFimContrato);

  if (dados.prazoContrato !== undefined && dados.prazoContrato !== "") {
    dados.prazoContrato = Number(dados.prazoContrato);
  } else {
    dados.prazoContrato = null;
  }

  if (dados.valorCaucao !== undefined && dados.valorCaucao !== "") {
    dados.valorCaucao = Number(dados.valorCaucao);
  } else {
    dados.valorCaucao = null;
  }

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.kitnetNome;
  delete dados.unidadeNome;
  delete dados.kitnet;
  delete dados.contratos;

  return dados;

};

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

const buscarPorId = (id) => {
  return prisma.inquilino.findUnique({
    where: { id },
    include: {
      kitnet: {
        include: {
          unidade: true
        }
      }
    }
  });
};

const criar = async (dados) => {

  dados = sanitizar(dados);

  const inquilino = await prisma.inquilino.create({
    data: dados
  });

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  return inquilino;
};

const atualizar = async (id, dados) => {

  const anterior = await prisma.inquilino.findUnique({
    where: { id }
  });

  dados = sanitizar(dados);

  const inquilino = await prisma.inquilino.update({
    where: { id },
    data: dados
  });

  if (
    anterior &&
    dados.kitnetId &&
    dados.kitnetId !== anterior.kitnetId
  ) {

    await prisma.kitnet.update({
      where: {
        id: anterior.kitnetId
      },
      data: {
        ocupada: false,
        status: 'DISPONIVEL'
      }
    });

    await prisma.kitnet.update({
      where: {
        id: dados.kitnetId
      },
      data: {
        ocupada: true,
        status: 'OCUPADA'
      }
    });

  }

  return inquilino;
};

const remover = async (id) => {

  const inquilino = await prisma.inquilino.findUnique({
    where: { id }
  });

  if (inquilino) {
    await prisma.kitnet.update({
      where: {
        id: inquilino.kitnetId
      },
      data: {
        ocupada: false,
        status: 'DISPONIVEL'
      }
    });
  }

  return prisma.inquilino.delete({
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
