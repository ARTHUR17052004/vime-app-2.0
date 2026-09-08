const prisma = require("../config/prisma");

/*
  Núcleo da geração de cobrança de aluguel a partir de um Contrato --
  usado tanto pelo job diário (gerarCobrancasRecorrentesJob, que roda
  pra todo contrato ATIVO) quanto na hora de cadastrar um inquilino com
  contrato automático (gera a primeira cobrança na hora, sem esperar o
  job do dia seguinte).

  Regras (as mesmas de sempre, só extraídas pra um lugar só):
  - Residência com "Data de Início da Cobrança" no futuro -- não gera
    ainda.
  - Já existe cobrança de Aluguel pro mês corrente (qualquer status)?
    Não duplica.
  - Alguma cobrança de Aluguel do contrato ainda não paga? Não empilha
    mais uma em cima -- espera essa ser quitada primeiro.
*/

const gerarCobrancaParaContrato = async (contrato) => {

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth(); // 0-indexed

  const inicioMes = new Date(ano, mes, 1);
  const inicioProximoMes = new Date(ano, mes + 1, 1);

  const unidade =
    contrato.unidade ||
    (contrato.unidadeId
      ? await prisma.unidade.findUnique({ where: { id: contrato.unidadeId } })
      : null);

  if (unidade?.dataInicioCobranca && unidade.dataInicioCobranca > hoje) {
    return { criada: false, motivo: "aindaNaoIniciou" };
  }

  const receitasDoContrato = await prisma.receita.findMany({
    where: { contratoId: contrato.id, categoria: "Aluguel" },
  });

  const jaTemEsteMes = receitasDoContrato.some(
    (r) =>
      r.vencimento &&
      r.vencimento >= inicioMes &&
      r.vencimento < inicioProximoMes
  );

  if (jaTemEsteMes) {
    return { criada: false, motivo: "jaExiste" };
  }

  const temPendente = receitasDoContrato.some((r) => r.status !== "PAGA");

  if (temPendente) {
    return { criada: false, motivo: "aguardandoPagamento" };
  }

  const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
  const dia = Math.min(contrato.diaVencimento || 1, ultimoDiaDoMes);
  const vencimento = new Date(ano, mes, dia);

  const receita = await prisma.receita.create({
    data: {
      contratoId: contrato.id,
      categoria: "Aluguel",
      descricao: `Aluguel - ${mes + 1}/${ano}`,
      valor: contrato.valorAluguel,
      vencimento,
      status: "PENDENTE",
    },
  });

  return { criada: true, receita };

};

module.exports = {
  gerarCobrancaParaContrato,
};
