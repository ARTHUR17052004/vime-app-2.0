const prisma = require("../config/prisma");
const { emitirAtualizacao } = require("../socket");
const configuracaoFinanceiroService = require("../services/configuracaoFinanceiroService");

/*
  Recorrência de Receita direto (sem Contrato -- esse já tem seu
  próprio motor em gerarCobrancasRecorrentesJob, mas depende de uma
  tabela que este sistema não usa). Pra cada Receita marcada
  recorrente: true e já PAGA, garante que exista a cobrança do mês
  seguinte (mesmo inquilino/pagador, categoria e valor) -- só gera a
  próxima depois que a atual foi paga, nunca empilha dívida em cima de
  dívida (mesma regra pedida pelo usuário pro motor de Contrato).
*/

function proximoMesMesmoDia(data) {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const diaOriginal = data.getDate();
  const ultimoDiaProximoMes = new Date(ano, mes + 2, 0).getDate();
  const dia = Math.min(diaOriginal, ultimoDiaProximoMes);
  return new Date(ano, mes + 1, dia);
}

module.exports = async () => {

  console.log("[JOB] Gerando recorrência de receitas...");

  const pagasRecorrentes = await prisma.receita.findMany({
    where: { recorrente: true, status: "PAGA" },
  });

  const config = await configuracaoFinanceiroService.buscar();
  const taxa = config.taxaBoletoPercentual || 0;

  let criadas = 0;
  let jaExistiam = 0;
  let semVencimento = 0;

  for (const receita of pagasRecorrentes) {

    if (!receita.vencimento) {
      semVencimento++;
      continue;
    }

    const proximoVencimento = proximoMesMesmoDia(new Date(receita.vencimento));

    const inicioMesAlvo = new Date(proximoVencimento.getFullYear(), proximoVencimento.getMonth(), 1);
    const inicioMesSeguinte = new Date(proximoVencimento.getFullYear(), proximoVencimento.getMonth() + 1, 1);

    const where = {
      categoria: receita.categoria,
      vencimento: { gte: inicioMesAlvo, lt: inicioMesSeguinte },
      inquilinoId: receita.inquilinoId || null,
    };

    const existentes = await prisma.receita.findMany({ where });

    const jaExiste = receita.inquilinoId
      ? existentes.length > 0
      : existentes.some((r) => r.pagadorCpf && r.pagadorCpf === receita.pagadorCpf);

    if (jaExiste) {
      jaExistiam++;
      continue;
    }

    const valorLiquido = Math.round(receita.valor * (1 - taxa / 100) * 100) / 100;

    await prisma.receita.create({
      data: {
        inquilinoId: receita.inquilinoId,
        locadorId: receita.locadorId,
        pagadorNome: receita.pagadorNome,
        pagadorCpf: receita.pagadorCpf,
        pagadorEmail: receita.pagadorEmail,
        pagadorTelefone: receita.pagadorTelefone,
        categoria: receita.categoria,
        descricao: receita.descricao,
        valor: receita.valor,
        valorLiquido,
        vencimento: proximoVencimento,
        status: "PENDENTE",
        recorrente: true,
      },
    });

    criadas++;

  }

  if (criadas > 0) emitirAtualizacao("receita");

  console.log(
    `[JOB] Recorrência de receitas: ${criadas} criadas, ${jaExistiam} já existiam, ${semVencimento} sem vencimento (${pagasRecorrentes.length} receitas pagas recorrentes revisadas).`
  );

  return { criadas, jaExistiam, semVencimento, total: pagasRecorrentes.length };

};
