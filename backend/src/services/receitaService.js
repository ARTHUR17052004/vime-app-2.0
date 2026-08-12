const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');

const listar = () => {
  return prisma.receita.findMany({
    include: {
      contrato: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.receita.findUnique({
    where: { id },
    include: {
      contrato: true
    }
  });
};

const criar = async (dados) => {

  if (dados.vencimento) dados.vencimento = new Date(dados.vencimento);
  if (dados.dataPagamento) dados.dataPagamento = new Date(dados.dataPagamento);

  const receita = await prisma.receita.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: receita
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "RECEITAS",
    acao: "CRIAR",
    descricao: `Receita ${receita.id} criada.`
  });

  return receita;

};

const atualizar = async (id, dados) => {

  if (dados.vencimento) dados.vencimento = new Date(dados.vencimento);
  if (dados.dataPagamento) dados.dataPagamento = new Date(dados.dataPagamento);

  const anterior = await prisma.receita.findUnique({
    where: { id }
  });

  const receita = await prisma.receita.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: receita
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "RECEITAS",
    acao: "ATUALIZAR",
    descricao: `Receita ${receita.id} atualizada.`
  });

  return receita;

};

const remover = async (id) => {

  const receita = await prisma.receita.findUnique({
    where: { id }
  });

  if (!receita) {
    throw new Error("Receita não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "EXCLUIR",
    valorAnterior: receita,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "RECEITAS",
    acao: "EXCLUIR",
    descricao: `Receita ${receita.id} excluída.`
  });

  return prisma.receita.delete({
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