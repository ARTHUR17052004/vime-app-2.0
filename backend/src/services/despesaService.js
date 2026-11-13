const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');
const { filtroDespesa } = require('../utils/escopoLocador');
const { emitirAtualizacao } = require('../socket');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const campoObrigatorioService = require('./campoObrigatorioService');
const { diffCampos } = require('../utils/diffCampos');

const CAMPOS_DESPESA = {
  descricao: 'descrição',
  categoria: 'categoria',
  valor: { rotulo: 'valor', tipo: 'moeda' },
  vencimento: { rotulo: 'vencimento', tipo: 'data' },
  dataPagamento: { rotulo: 'data de pagamento', tipo: 'data' },
  status: 'status',
  contaPagamentoId: 'conta',
};

const sanitizar = (dados) => {

  if (dados.contaPagamentoId !== undefined) dados.contaPagamentoId = dados.contaPagamentoId || null;

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
  delete dados.contaPagamento;

  return dados;

};

// Não inclui contaPagamento inteira (igual Receita já fazia) -- ela
// carrega `credenciais` do banco (client secret, api key...), e aqui
// viraria exposta pra qualquer um que carregasse a lista de Despesas.
// O front resolve o nome localmente a partir da lista de contas que já
// busca separado (mesmo padrão de FinanceiroReceitas.jsx).
const listar = (usuario) => {
  return prisma.despesa.findMany({
    where: filtroDespesa(usuario),
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

const criar = async (dados, autor) => {

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('despesa', dados);

  const despesa = await prisma.despesa.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "DESPESAS",
    registroId: despesa.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: despesa
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "DESPESAS",
    acao: "CRIAR",
    descricao: `Despesa "${despesa.descricao || despesa.id}" criada por ${autor?.nome || "Sistema"}.`
  });

  emitirAtualizacao("despesa");

  return despesa;

};

const atualizar = async (id, dados, autor) => {

  dados = sanitizar(dados);

  const anterior = await prisma.despesa.findUnique({
    where: { id }
  });

  // Atualização parcial (ex.: só marcar como paga) não pode reprovar
  // por "faltar" um campo que já está preenchido desde a criação.
  await campoObrigatorioService.validar('despesa', { ...anterior, ...dados });

  const despesa = await prisma.despesa.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "DESPESAS",
    registroId: despesa.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: despesa
  });

  const alteracoes = diffCampos(anterior, despesa, CAMPOS_DESPESA);

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "DESPESAS",
    acao: "ATUALIZAR",
    descricao: `Despesa "${despesa.descricao || despesa.id}" atualizada por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`
  });

  emitirAtualizacao("despesa");

  return despesa;

};

const remover = async (id, autor) => {

  const despesa = await prisma.despesa.findUnique({
    where: { id }
  });

  if (!despesa) {
    throw new Error("Despesa não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "DESPESAS",
    registroId: despesa.id,
    acao: "EXCLUIR",
    valorAnterior: despesa,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "DESPESAS",
    acao: "EXCLUIR",
    descricao: `Despesa "${despesa.descricao || despesa.id}" excluída por ${autor?.nome || "Sistema"}.`
  });

  const removida = await prisma.despesa.delete({
    where: { id }
  });

  emitirAtualizacao("despesa");

  return removida;

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};