const prisma = require('../config/prisma');

const listar = () => {
  return prisma.signatarioFixo.findMany({
    orderBy: { ordem: 'asc' },
  });
};

const listarAtivos = () => {
  return prisma.signatarioFixo.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
  });
};

const criar = (dados) => {

  if (!dados.nome) {
    throw new Error('Nome do signatário é obrigatório.');
  }

  if (!dados.email) {
    throw new Error('E-mail do signatário é obrigatório.');
  }

  return prisma.signatarioFixo.create({ data: dados });

};

const atualizar = (id, dados) => {

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;

  return prisma.signatarioFixo.update({
    where: { id },
    data: dados,
  });

};

const excluir = (id) => {
  return prisma.signatarioFixo.delete({ where: { id } });
};

module.exports = {
  listar,
  listarAtivos,
  criar,
  atualizar,
  excluir,
};
