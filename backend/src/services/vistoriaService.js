const prisma = require('../config/prisma');
const logService = require('./logService');

const listar = () => {
  return prisma.vistoria.findMany({
    include: {
      ocorrencias: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.vistoria.findUnique({
    where: { id },
    include: {
      ocorrencias: true
    }
  });
};

const criar = async (dados) => {

  const vistoria = await prisma.vistoria.create({
    data: dados
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    acao: "CRIAR",
    descricao: `Vistoria ${vistoria.id} criada.`
  });

  return vistoria;

};

const atualizar = async (id, dados) => {

  const vistoria = await prisma.vistoria.update({
    where: { id },
    data: dados
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    acao: "ATUALIZAR",
    descricao: `Vistoria ${vistoria.id} atualizada.`
  });

  return vistoria;

};

const remover = async (id) => {

  const vistoria = await prisma.vistoria.findUnique({
    where: { id }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    acao: "EXCLUIR",
    descricao: `Vistoria ${vistoria.id} excluída.`
  });

  return prisma.vistoria.delete({
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