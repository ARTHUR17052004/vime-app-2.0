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

const criar = async (dados) => {

  console.log('CRIAR INQUILINO');
  console.log(dados);

  const inquilino = await prisma.inquilino.create({
    data: dados
  });

  console.log('ATUALIZANDO KITNET:', dados.kitnetId);

  const kitnet = await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  console.log('KITNET ATUALIZADA:', kitnet);

  return inquilino;
};

const atualizar = (id, dados) => {
  return prisma.inquilino.update({
    where: { id },
    data: dados
  });
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
  criar,
  atualizar,
  remover
};