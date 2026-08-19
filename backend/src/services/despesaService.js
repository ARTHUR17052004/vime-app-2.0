const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');

const sanitizar = (dados) => {

  if (dados.vencimento !== undefined) dados.vencimento = paraDataOuNull(dados.vencimento);
  if (dados.dataPagamento !== undefined) dados.dataPagamento = paraDataOuNull(dados.dataPagamento);

  if (dados.valor !== undefined) {
    const valor = Number(String(dados.valor).replace(',', '.'));
    if (Number.isNaN(valor)) {
      throw new Error('Valor inválido.');
    }
    dados.valor = valor;
  }

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.unidade;

  return dados;

};

const listar = () => {
  return prisma.despesa.findMany({
    include: {
      unidade: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.despesa.findUnique({
    where: { id },
    include: {
      unidade: true
    }
  });
};

const criar = async (dados) => {

  dados = sanitizar(dados);

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

  dados = sanitizar(dados);

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