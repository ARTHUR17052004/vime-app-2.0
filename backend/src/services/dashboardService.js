const prisma = require('../config/prisma');

const resumo = async () => {

  const inquilinos = await prisma.inquilino.count();

  const unidades = await prisma.unidade.count();

  const kitnets = await prisma.kitnet.count();

  const locadores = await prisma.locador.count();

  const contratosAtivos = await prisma.contrato.count({
    where: {
      status: 'ATIVO'
    }
  });

  const contratosVencendo = 0;

  const inadimplentes = await prisma.contrato.count({
    where: {
      status: 'INADIMPLENTE'
    }
  });

  const solicitacoesPendentes = await prisma.solicitacao.count({
    where: {
      status: {
        notIn: ['ATENDIDA', 'REJEITADA']
      }
    }
  });

  const receitas = await prisma.receita.findMany({
    where: {
      status: 'PENDENTE'
    }
  });

  const receitaMensal = receitas.reduce((total, receita) => {
    return total + receita.valor;
  }, 0);

  const kitnetsOcupadas = await prisma.kitnet.count({
    where: {
      ocupada: true
    }
  });

  const ocupacao =
    kitnets > 0
      ? Math.round((kitnetsOcupadas / kitnets) * 100)
      : 0;

  return {
    inquilinos,
    unidades,
    kitnets,
    locadores,
    receitaMensal,
    ocupacao,
    contratosAtivos,
    contratosVencendo,
    inadimplentes,
    solicitacoesPendentes
  };
};

const STATUS_ATIVIDADE = {
  SOLICITADA: 'solicitada',
  'EM COTAÇÃO': 'em cotação',
  'AGUARDANDO COMPRA': 'aguardando compra',
  ATENDIDA: 'atendida',
  REJEITADA: 'rejeitada'
};

const atividades = async () => {

  const solicitacoes = await prisma.solicitacao.findMany({
    take: 10,
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return solicitacoes.map(item => ({
    id: item.id,
    tipo: 'SOLICITACAO',
    descricao: `${item.numero} · ${item.titulo}`,
    data: item.updatedAt,
    status: STATUS_ATIVIDADE[item.status] || item.status,
    link: `/solicitacoes/${item.id}`
  }));
};

const alertas = async () => {

  const inadimplentes = await prisma.contrato.count({
    where: {
      status: 'INADIMPLENTE'
    }
  });

  const lista = [];

  if (inadimplentes > 0) {
    lista.push({
      tipo: 'INADIMPLENCIA',
      titulo: `${inadimplentes} contrato(s) inadimplente(s)`
    });
  }

  return lista;
};

const ocupacao = async () => {

  const total = await prisma.kitnet.count();

  const ocupadas = await prisma.kitnet.count({
    where: {
      ocupada: true
    }
  });

  const vazias = total - ocupadas;

  return {
    ocupadas,
    vazias,
    percentual: total > 0
      ? Math.round((ocupadas / total) * 100)
      : 0
  };
};

const financeiro = async () => {

  const receitas = await prisma.receita.findMany();

  let recebido = 0;
  let pendente = 0;
  let atrasado = 0;
  let cancelado = 0;

  receitas.forEach(r => {

    if (r.status === 'RECEBIDO')
      recebido += r.valor;

    if (r.status === 'PENDENTE')
      pendente += r.valor;

    if (r.status === 'ATRASADO')
      atrasado += r.valor;

    if (r.status === 'CANCELADO')
      cancelado += r.valor;

  });

  return {
    recebido,
    pendente,
    atrasado,
    cancelado
  };
};

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const receitasMensais = async (ano) => {

  const receitas = await prisma.receita.findMany({
    where: {
      vencimento: {
        gte: new Date(`${ano}-01-01`),
        lte: new Date(`${ano}-12-31`)
      }
    }
  });

  const totais = new Array(12).fill(0);

  receitas.forEach(r => {
    if (!r.vencimento) return;

    const mes = new Date(r.vencimento).getMonth();

    totais[mes] += r.valor;
  });

  return MESES.map((mes, index) => ({
    mes,
    receita: totais[index]
  }));
};

module.exports = {
  resumo,
  atividades,
  alertas,
  ocupacao,
  financeiro,
  receitasMensais
};