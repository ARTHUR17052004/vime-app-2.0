const prisma = require("../config/prisma");

/*
  Cobrança recorrente automática.

  Para cada Contrato ATIVO, garante que exista uma Receita (cobrança de
  aluguel) para o mês corrente. Se ainda não existir, cria uma nova
  Receita PENDENTE com vencimento no dia configurado no contrato
  (`diaVencimento`). Isso elimina a necessidade de um humano criar
  manualmente a cobrança de cada mês.

  Importante: este job NÃO envia a cobrança ao Asaas automaticamente —
  isso continua sendo uma ação humana deliberada (botão "Enviar ao
  Asaas" em outra parte do sistema). Aqui só criamos o registro local.
*/

module.exports = async () => {
  console.log("[JOB] Gerando cobranças recorrentes...");

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth(); // 0-indexed

  const inicioMes = new Date(ano, mes, 1);
  const inicioProximoMes = new Date(ano, mes + 1, 1);

  const contratos = await prisma.contrato.findMany({
    where: { status: "ATIVO" },
  });

  let criadas = 0;
  let existentes = 0;

  for (const contrato of contratos) {
    const jaExiste = await prisma.receita.findFirst({
      where: {
        contratoId: contrato.id,
        vencimento: {
          gte: inicioMes,
          lt: inicioProximoMes,
        },
      },
    });

    if (jaExiste) {
      existentes++;
      continue;
    }

    // O dia de vencimento do contrato pode não existir no mês atual
    // (ex.: dia 31 em fevereiro) — nesse caso, usa o último dia do mês.
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const dia = Math.min(contrato.diaVencimento || 1, ultimoDiaDoMes);
    const vencimento = new Date(ano, mes, dia);

    await prisma.receita.create({
      data: {
        contratoId: contrato.id,
        categoria: "Aluguel",
        descricao: `Aluguel - ${mes + 1}/${ano}`,
        valor: contrato.valorAluguel,
        vencimento,
        status: "PENDENTE",
      },
    });

    criadas++;
  }

  console.log(
    `[JOB] Cobranças recorrentes: ${criadas} criadas, ${existentes} já existiam (${contratos.length} contratos ativos).`
  );

  return { criadas, existentes, total: contratos.length };
};
