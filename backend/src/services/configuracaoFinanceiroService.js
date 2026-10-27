const prisma = require("../config/prisma");

/*
  Registro único (sempre o de menor id) -- mesmo espírito do
  Configuracao (branding), só que escopado ao Financeiro. Cria sozinho
  na primeira leitura se ainda não existir.
*/

async function buscar() {

  const existente = await prisma.configuracaoFinanceiro.findFirst({ orderBy: { id: "asc" } });

  if (existente) return existente;

  return prisma.configuracaoFinanceiro.create({ data: {} });

}

async function atualizar({ taxaBoletoPercentual }) {

  const atual = await buscar();

  const taxa = Number(String(taxaBoletoPercentual).replace(",", "."));

  if (Number.isNaN(taxa) || taxa < 0 || taxa > 100) {
    throw new Error("Taxa de boleto inválida -- use um número entre 0 e 100.");
  }

  return prisma.configuracaoFinanceiro.update({
    where: { id: atual.id },
    data: { taxaBoletoPercentual: taxa },
  });

}

module.exports = { buscar, atualizar };
