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

  // Verifica se a kitnet existe
  const kitnet = await prisma.kitnet.findUnique({
    where: {
      id: dados.kitnetId
    }
  });

  if (!kitnet) {
    throw new Error('Kitnet não encontrada.');
  }

  // Impede criar contrato em kitnet ocupada
  if (kitnet.ocupada) {
    throw new Error('Esta kitnet já possui um contrato ativo.');
  }

  // Cria o contrato
  const contrato = await prisma.contrato.create({
    data: dados
  });

  // Cria a primeira receita automaticamente
  await prisma.receita.create({
    data: {
      contratoId: contrato.id,
      categoria: 'Aluguel',
      descricao: `Aluguel - ${kitnet.numero}`,
      valor: contrato.valorAluguel,
      vencimento: contrato.dataInicio,
      status: 'PENDENTE'
    }
  });

  // Marca a kitnet como ocupada
  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  return contrato;

};

const atualizar = (id, dados) => {
  return prisma.contrato.update({
    where: { id },
    data: dados
  });
};

const remover = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      receitas: true
    }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  if (contrato.receitas.length > 0) {
    throw new Error(
      'Não é possível excluir um contrato que possui receitas vinculadas.'
    );
  }

  return prisma.contrato.delete({
    where: { id }
  });

};

const encerrar = async (id) => {

  // Busca o contrato
  const contrato = await prisma.contrato.findUnique({
    where: { id }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  // Encerra o contrato
  const contratoEncerrado = await prisma.contrato.update({
    where: { id },
    data: {
      status: 'ENCERRADO',
      dataFim: contrato.dataFim || new Date()
    }
  });

  // Libera a kitnet
  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: 'DISPONIVEL'
    }
  });

  return contratoEncerrado;

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