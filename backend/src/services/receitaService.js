const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');
const { filtroReceita } = require('../utils/escopoLocador');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const campoObrigatorioService = require('./campoObrigatorioService');
const contaPagamentoService = require('./contaPagamentoService');
const { doContrato, doInquilino } = require('../utils/locadorDeRegistro');
const { diffCampos } = require('../utils/diffCampos');

const CAMPOS_RECEITA = {
  descricao: 'descrição',
  categoria: 'categoria',
  valor: { rotulo: 'valor', tipo: 'moeda' },
  vencimento: { rotulo: 'vencimento', tipo: 'data' },
  dataPagamento: { rotulo: 'data de pagamento', tipo: 'data' },
  status: 'status',
  pagadorNome: 'pagador',
};

const locadorDaReceita = async (dados) => {
  if (dados.contratoId) {
    const l = await doContrato(dados.contratoId);
    if (l) return l;
  }
  if (dados.inquilinoId) return doInquilino(dados.inquilinoId);
  return null;
};

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
  if (dados.valorLiquido !== undefined) dados.valorLiquido = paraNumeroOuNull(dados.valorLiquido);
  if (dados.recorrente !== undefined) dados.recorrente = Boolean(dados.recorrente);

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

const buscarPorId = (id, usuario) => {
  return prisma.receita.findFirst({
    where: { id, ...filtroReceita(usuario) },
    include: {
      contrato: { include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } }
    }
  });
};

// Valor líquido NUNCA vem do front (campo só de exibição lá) -- sempre
// recalculado aqui pela taxa da conta que processa essa receita (do
// locador do contrato/inquilino, ou a conta padrão do sistema -- mesma
// resolução de gatewayPagamentoService.enviarCobranca). Só mexe quando
// "valor" também está sendo definido nesta chamada, pra uma atualização
// parcial (ex.: só marcar como paga) não recalcular por engano.
// `registroExistente` é a Receita já salva, usada como fallback de
// contratoId/inquilinoId/locadorId numa atualização parcial que não
// reenvia esses campos.
async function aplicarValorLiquidoPadrao(dados, registroExistente) {

  if (dados.valor === undefined) return dados;

  const base = { ...registroExistente, ...dados };
  const locadorId = base.locadorId || await locadorDaReceita(base);
  const conta = await contaPagamentoService.resolverParaLocador(locadorId);
  const taxa = conta?.taxaBoletoPercentual || 0;

  dados.valorLiquido = Math.round(dados.valor * (1 - taxa / 100) * 100) / 100;

  return dados;

}

const criar = async (dados, autor) => {

  const modulo = extrairModulo(dados);

  dados = sanitizar(dados);
  dados = await aplicarValorLiquidoPadrao(dados);

  await campoObrigatorioService.validar(modulo, dados);

  // Escolha explícita no formulário (ex.: cobrança avulsa em Nova
  // Cobrança, sem contrato/inquilino pra inferir sozinho) tem
  // prioridade e nunca é sobrescrita. Sem isso: usuário restrito a um
  // locador -- a receita é sempre dele; senão, deriva do contrato ou
  // do inquilino.
  if (!dados.locadorId) {
    if (autor?.locadorId) {
      dados.locadorId = autor.locadorId;
    } else {
      dados.locadorId = await locadorDaReceita(dados);
    }
  }

  const receita = await prisma.receita.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: receita
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    acao: "CRIAR",
    descricao: `Receita "${receita.descricao || receita.id}" criada por ${autor?.nome || "Sistema"}.`
  });

  return receita;

};

const atualizar = async (id, dados, autor) => {

  const modulo = extrairModulo(dados);

  dados = sanitizar(dados);

  const anterior = await prisma.receita.findUnique({
    where: { id }
  });

  dados = await aplicarValorLiquidoPadrao(dados, anterior);

  // Atualização parcial (ex.: só marcar como paga) não pode reprovar
  // por "faltar" um campo que já está preenchido desde a criação.
  await campoObrigatorioService.validar(modulo, { ...anterior, ...dados });

  const receita = await prisma.receita.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: receita
  });

  const alteracoes = diffCampos(anterior, receita, CAMPOS_RECEITA);

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    acao: "ATUALIZAR",
    descricao: `Receita "${receita.descricao || receita.id}" atualizada por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`
  });

  return receita;

};

const remover = async (id, autor) => {

  const receita = await prisma.receita.findUnique({
    where: { id }
  });

  if (!receita) {
    throw new Error("Receita não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    registroId: receita.id,
    acao: "EXCLUIR",
    valorAnterior: receita,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RECEITAS",
    acao: "EXCLUIR",
    descricao: `Receita "${receita.descricao || receita.id}" excluída por ${autor?.nome || "Sistema"}.`
  });

  return prisma.receita.delete({
    where: { id }
  });

};

// Pro front mostrar a conta/taxa que vai valer ANTES de salvar --
// mesma resolução usada de verdade na criação (locadorDaReceita +
// contaPagamentoService), só que sem gravar nada.
const previsaoTaxaBoleto = async ({ inquilinoId, contratoId }) => {

  const locadorId = await locadorDaReceita({ inquilinoId, contratoId });
  const conta = await contaPagamentoService.resolverParaLocador(locadorId);

  return {
    contaNome: conta?.nome || null,
    taxaBoletoPercentual: conta?.taxaBoletoPercentual || 0,
  };

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  previsaoTaxaBoleto
};