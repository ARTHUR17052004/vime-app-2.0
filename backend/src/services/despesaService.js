const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');

const listar = () => {
  return prisma.despesa.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.despesa.findUnique({
    where: { id }
  });
};

const criar = async (dados) => {

  const despesa = await prisma.despesa.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "DESPESAS",
    registroId: despesa.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: despesa
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "DESPESAS",
    acao: "CRIAR",
    descricao: `Despesa ${despesa.id} criada.`
  });

  return despesa;

};

const atualizar = async (id, dados) => {

  const anterior = await prisma.despesa.findUnique({
    where: { id }
  });

  const despesa = await prisma.despesa.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "DESPESAS",
    registroId: despesa.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: despesa
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "DESPESAS",
    acao: "ATUALIZAR",
    descricao: `Despesa ${despesa.id} atualizada.`
  });

  return despesa;

};

const remover = async (id) => {

  const despesa = await prisma.despesa.findUnique({
    where: { id }
  });

  if (!despesa) {
    throw new Error("Despesa não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "DESPESAS",
    registroId: despesa.id,
    acao: "EXCLUIR",
    valorAnterior: despesa,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "DESPESAS",
    acao: "EXCLUIR",
    descricao: `Despesa ${despesa.id} excluída.`
  });

  return prisma.despesa.delete({
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