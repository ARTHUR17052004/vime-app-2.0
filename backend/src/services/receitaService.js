const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');
const { filtroReceita } = require('../utils/escopoLocador');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const campoObrigatorioService = require('./campoObrigatorioService');

// "Nova Receita" e "Nova Cobrança" criam a mesma Receita por baixo,
// mas são telas diferentes -- cada uma com sua própria configuração em
// Campos Obrigatórios ("receita" vs "cobranca"). `origemFormulario` diz
// qual delas validar; não é campo do model, sai do payload antes do
// create/update.
const extrairModulo = (dados) => {
  const modulo = dados.origemFormulario === 'cobranca' ? 'cobranca' : 'receita';
  delete dados.origemFormulario;
  return modulo;
};

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

  const paraNumeroOuNull = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
  };

  if (dados.descontoValor !== undefined) dados.descontoValor = paraNumeroOuNull(dados.descontoValor);
  if (dados.descontoDias !== undefined) dados.descontoDias = dados.descontoDias === '' || dados.descontoDias === null ? null : parseInt(dados.descontoDias, 10);
  if (dados.multaValor !== undefined) dados.multaValor = paraNumeroOuNull(dados.multaValor);
  if (dados.jurosValor !== undefined) dados.jurosValor = paraNumeroOuNull(dados.jurosValor);

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.contrato;
  delete dados.inquilino;

  return dados;

};

const listar = (usuario) => {
  return prisma.receita.findMany({
    where: filtroReceita(usuario),
    include: {
      contrato: { include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } }
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
      contrato: { include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } }
    }
  });
};

const criar = async (dados) => {

  const modulo = extrairModulo(dados);

  dados = sanitizar(dados);

  await campoObrigatorioService.validar(modulo, dados);

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

  const modulo = extrairModulo(dados);

  dados = sanitizar(dados);

  await campoObrigatorioService.validar(modulo, dados);

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