const prisma = require("../config/prisma");
const { emitirAtualizacao } = require("../socket");
const { multaJurosPadrao, existeAluguelDuplicado } = require("./receitaService");

/*
  Núcleo da geração de cobrança de aluguel a partir de um Contrato --
  usado pelo job mensal (gerarCobrancasRecorrentesJob, que roda todo
  dia 20 pra todo contrato ATIVO).

  Desde 11/2026 esse motor gera sempre a cobrança do MÊS SEGUINTE
  (nunca a do mês corrente) -- é a emissão do dia 20 pedida pelo
  usuário: a receita nasce Pendente e sem envio ao banco, com uma
  janela de ~10 dias pra equipe revisar antes do disparo automático do
  dia 01 (ver dispararReceitasBancoJob.js, que é quem realmente manda
  ao banco -- este arquivo só cria o registro local, igual sempre foi).

  Regras:
  - Residência com "Data de Início da Cobrança" no futuro -- não gera
    ainda.
  - Contrato termina (dataFim) antes do vencimento que essa cobrança
    teria? Não gera -- cobraria um período em que o contrato já não
    está mais vigente (regra dos 4 meses do contrato).
  - Já existe cobrança de Aluguel pro mês seguinte (qualquer status)?
    Não duplica.
  - Alguma cobrança de Aluguel do contrato ainda não paga? Não empilha
    mais uma em cima -- espera essa ser quitada primeiro.
*/

const gerarCobrancaParaContrato = async (contrato) => {

  const hoje = new Date();

  // Sempre o mês seguinte ao de hoje -- é esse 1 mês de antecedência
  // (gerar dia 20, vencimento só no mês que vem) que garante a
  // cobrança nunca nascer com vencimento já no passado.
  const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
  const ano = proximoMes.getFullYear();
  const mes = proximoMes.getMonth(); // 0-indexed

  const inicioMes = new Date(ano, mes, 1);

  const unidade =
    contrato.unidade ||
    (contrato.unidadeId
      ? await prisma.unidade.findUnique({ where: { id: contrato.unidadeId } })
      : null);

  if (unidade?.dataInicioCobranca && unidade.dataInicioCobranca > hoje) {
    return { criada: false, motivo: "aindaNaoIniciou" };
  }

  const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
  const dia = Math.min(contrato.diaVencimento || 1, ultimoDiaDoMes);
  const vencimento = new Date(ano, mes, dia);

  if (contrato.dataFim && new Date(contrato.dataFim) < vencimento) {
    return { criada: false, motivo: "contratoEncerraAntes" };
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
  // do contrato/inquilino, não só o mês alvo. Cancelada nunca conta
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
