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

  const solicitacoesPendentes = 0;

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

const atividades = async () => {

  const contratos = await prisma.contrato.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      inquilino: true
    }
  });

  return contratos.map(item => ({
    id: item.id,
    tipo: 'CONTRATO',
    descricao: `Contrato criado para ${item.inquilino.nome}`,
    data: item.createdAt
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

module.exports = {
  resumo,
  atividades,
  alertas,
  ocupacao,
  financeiro
};