const prisma = require('../config/prisma');

const fluxoCaixa = async () => {

  const receitas = await prisma.receita.findMany();

  const despesas = await prisma.despesa.findMany();

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

module.exports = {
  fluxoCaixa
};