const prisma = require('../config/prisma');

const listar = () => {
  return prisma.contrato.findMany({
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.contrato.findUnique({
    where: { id },
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true
    }
  });
};

const criar = async (dados) => {

  console.log("CRIANDO CONTRATO");

  const contrato = await prisma.contrato.create({
    data: dados
  });

  console.log("CONTRATO:", contrato.id);

  console.log("CRIANDO RECEITA");

  await prisma.receita.create({
    data: {
      contratoId: contrato.id,
      categoria: 'Aluguel',
      descricao: 'Aluguel Kitnet',
      valor: contrato.valorAluguel,
      vencimento: contrato.dataInicio,
      status: 'PENDENTE'
    }
  });

  console.log("RECEITA CRIADA");

  return contrato;
};

const atualizar = (id, dados) => {
  return prisma.contrato.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.contrato.delete({
    where: { id }
  });
};

const encerrar = (id) => {
  return prisma.contrato.update({
    where: { id },
    data: {
      status: 'ENCERRADO'
    }
  });
};

const inadimplente = (id) => {
  return prisma.contrato.update({
    where: { id },
    data: {
      status: 'INADIMPLENTE'
    }
  });
};

const renovar = (id, dados) => {
  return prisma.contrato.update({
    where: { id },
    data: dados
  });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  encerrar,
  inadimplente,
  renovar
};