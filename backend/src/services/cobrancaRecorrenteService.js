const prisma = require("../config/prisma");
const { emitirAtualizacao } = require("../socket");
const { multaJurosPadrao, existeAluguelDuplicado } = require("./receitaService");

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

  // existeAluguelDuplicado (receitaService.js) é a ÚNICA checagem de
  // verdade pra "já existe Aluguel esse mês" -- cruza Contrato e
  // Inquilino do mesmo jeito que a criação manual e o outro motor
  // (gerarRecorrenciaReceitasJob.js) usam, pra nunca mais divergir
  // feito antes (foi exatamente essa divergência que causou 29
  // "Aluguel" duplicados em 11/2026).
  const jaTemEsteMes = await existeAluguelDuplicado({
    categoria: "Aluguel",
    vencimento: inicioMes,
    contratoId: contrato.id,
  });

  if (jaTemEsteMes) {
    return { criada: false, motivo: "jaExiste" };
  }

  // Regra à parte (não é sobre "já existe esse mês", é sobre "ainda
  // não quitou um mês anterior") -- continua olhando todas as receitas
  // do contrato/inquilino, não só o mês atual. Cancelada nunca conta
  // como pendente (não é cobrança "em aberto" nenhuma -- sem isso, uma
  // duplicata cancelada travava pra sempre a geração do mês seguinte).
  const receitasDoContrato = await prisma.receita.findMany({
    where: {
      categoria: "Aluguel",
      status: { not: "CANCELADA" },
      OR: [
        { contratoId: contrato.id },
        ...(contrato.inquilinoId ? [{ inquilinoId: contrato.inquilinoId }] : []),
      ],
    },
  });

  const temPendente = receitasDoContrato.some((r) => r.status !== "PAGA");

  if (temPendente) {
    return { criada: false, motivo: "aguardandoPagamento" };
  }

  const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
  const dia = Math.min(contrato.diaVencimento || 1, ultimoDiaDoMes);
  const vencimento = new Date(ano, mes, dia);

  const { multaValor, jurosValor } = await multaJurosPadrao(contrato.locadorId);

  const receita = await prisma.receita.create({
    data: {
      contratoId: contrato.id,
      categoria: "Aluguel",
      descricao: `Aluguel - ${mes + 1}/${ano}`,
      valor: contrato.valorAluguel,
      vencimento,
      status: "PENDENTE",
      multaValor,
      jurosValor,
    },
  });

  emitirAtualizacao("receita");

  return { criada: true, receita };

};

module.exports = {
  gerarCobrancaParaContrato,
};
