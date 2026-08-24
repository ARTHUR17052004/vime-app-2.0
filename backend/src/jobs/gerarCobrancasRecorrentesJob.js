const prisma = require("../config/prisma");

/*
  Cobrança recorrente automática.

  Para cada Contrato ATIVO, garante que exista uma Receita (cobrança de
  aluguel) para o mês corrente -- mas só gera uma nova se a última
  cobrança já estiver PAGA. Se a última ainda estiver pendente/atrasada,
  não cria outra (evita empilhar dívida em vez de cobrar a que já
  existe) -- pedido explícito do usuário.

  Cada residência (Unidade) pode ter uma "Data de Início da Cobrança"
  (`dataInicioCobranca`); contratos de residências com essa data no
  futuro ainda não entram no job. Sem data definida, sempre valeu (não
  trava nada -- comportamento anterior).

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
    include: { unidade: true },
  });

  let criadas = 0;
  let existentes = 0;
  let aguardandoPagamento = 0;
  let aindaNaoIniciou = 0;

  for (const contrato of contratos) {

    if (
      contrato.unidade?.dataInicioCobranca &&
      contrato.unidade.dataInicioCobranca > hoje
    ) {
      aindaNaoIniciou++;
      continue;
    }

    const receitasDoContrato = await prisma.receita.findMany({
      where: { contratoId: contrato.id, categoria: "Aluguel" },
    });

    // Já existe cobrança pro mês atual (em qualquer status)? Não cria
    // outra. Checa todas, não só "a mais recente por vencimento" --
    // uma cobrança futura já paga adiantada não pode mascarar a
    // checagem do mês corrente.
    const jaTemEsteMes = receitasDoContrato.some(
      (r) =>
        r.vencimento &&
        r.vencimento >= inicioMes &&
        r.vencimento < inicioProximoMes
    );

    if (jaTemEsteMes) {
      existentes++;
      continue;
    }

    // Alguma cobrança (de qualquer período) ainda não paga? Mantém
    // como está, não empilha mais uma por cima.
    const temPendente = receitasDoContrato.some((r) => r.status !== "PAGA");

    if (temPendente) {
      aguardandoPagamento++;
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
    `[JOB] Cobranças recorrentes: ${criadas} criadas, ${existentes} já existiam, ${aguardandoPagamento} aguardando pagamento da anterior, ${aindaNaoIniciou} ainda não iniciaram cobrança (${contratos.length} contratos ativos).`
  );

  return { criadas, existentes, aguardandoPagamento, aindaNaoIniciou, total: contratos.length };
};
