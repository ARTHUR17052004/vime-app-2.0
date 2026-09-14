const prisma = require('../config/prisma');
const { filtroReceita, filtroDespesa } = require('../utils/escopoLocador');

const fluxoCaixa = async (usuario) => {

  const receitas = await prisma.receita.findMany({ where: filtroReceita(usuario) });

  const despesas = await prisma.despesa.findMany({ where: filtroDespesa(usuario) });

  const fluxo = [];

  receitas.forEach(receita => {
    fluxo.push({
      tipo: 'RECEITA',
      categoria: receita.categoria,
      descricao: receita.descricao,
      valor: receita.valor,
      status: receita.status
    });
  });

  despesas.forEach(despesa => {
    fluxo.push({
      tipo: 'DESPESA',
      categoria: despesa.categoria,
      descricao: despesa.descricao,
      valor: despesa.valor,
      status: despesa.status
    });
  });

  return fluxo;

};

const resumo = async (usuario) => {

  const receitas = await prisma.receita.findMany({ where: filtroReceita(usuario) });

  const despesas = await prisma.despesa.findMany({ where: filtroDespesa(usuario) });

  const totalReceitas = receitas.reduce(
    (total, item) => total + item.valor,
    0
  );

  const totalDespesas = despesas.reduce(
    (total, item) => total + item.valor,
    0
  );

  return {
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    quantidadeReceitas: receitas.length,
    quantidadeDespesas: despesas.length
  };

};

module.exports = {
  fluxoCaixa,
  resumo
};