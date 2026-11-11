const prisma = require("../config/prisma");
const { emitirAtualizacao } = require("../socket");
const contaPagamentoService = require("../services/contaPagamentoService");
const { kitnetDaReceita, multaJurosPadrao } = require("../services/receitaService");

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

// A descrição de template "Aluguel - 11/2026" ficava copiada igual pra
// cobrança do mês seguinte (ex.: vencendo em dezembro, mas ainda
// escrito "11/2026") -- só troca o "- M/AAAA" do final, se tiver; o
// resto do texto (ex.: "Aluguel") fica igual, pra não estragar uma
// descrição digitada diferente que não siga esse padrão.
function descricaoProximoMes(descricaoAnterior, proximoVencimento) {

  const mesAno = `${proximoVencimento.getMonth() + 1}/${proximoVencimento.getFullYear()}`;

  if (/ - \d{1,2}\/\d{4}$/.test(descricaoAnterior || "")) {
    return descricaoAnterior.replace(/ - \d{1,2}\/\d{4}$/, ` - ${mesAno}`);
  }

  return descricaoAnterior;

}

module.exports = async () => {

  console.log("[JOB] Gerando recorrência de receitas...");

  const pagasRecorrentes = await prisma.receita.findMany({
    where: { recorrente: true, status: "PAGA" },
  });

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

    // Também olha receita ligada por Contrato desse mesmo Inquilino
    // (ver cobrancaRecorrenteService.js, o outro motor de recorrência --
    // os dois geram "Aluguel" pro mesmo inquilino sem se conhecerem).
    // Sem isso, esse motor duplicava por cima da cobrança que o motor
    // de Contrato já tinha criado pro mês -- foi o que aconteceu em
    // 11/2026, em quase todo contrato ativo.
    const contratosDoInquilino = receita.inquilinoId
      ? await prisma.contrato.findMany({
          where: { inquilinoId: receita.inquilinoId },
          select: { id: true },
        })
      : [];

    const where = {
      categoria: receita.categoria,
      vencimento: { gte: inicioMesAlvo, lt: inicioMesSeguinte },
      OR: receita.inquilinoId
        ? [
            { inquilinoId: receita.inquilinoId },
            ...(contratosDoInquilino.length > 0
              ? [{ contratoId: { in: contratosDoInquilino.map((c) => c.id) } }]
              : []),
          ]
        : [{ inquilinoId: null }],
    };

    const existentes = await prisma.receita.findMany({ where });

    const jaExiste = receita.inquilinoId
      ? existentes.length > 0
      : existentes.some((r) => r.pagadorCpf && r.pagadorCpf === receita.pagadorCpf);

    if (jaExiste) {
      jaExistiam++;
      continue;
    }

    // Taxa é da conta de PAGAMENTO, não do sistema inteiro -- resolve
    // pela kitnet desta receita de novo a cada uma (uma kitnet pode ter
    // conta própria, diferente da padrão do locador -- ver
    // ContaPagamentoService.resolverParaKitnet).
    const kitnetId = await kitnetDaReceita(receita);
    const conta = await contaPagamentoService.resolverParaKitnet(kitnetId, receita.locadorId);
    const taxa = conta?.taxaBoletoValor || 0;

    const valorLiquido = Math.max(0, Math.round((receita.valor - taxa) * 100) / 100);

    // Carrega a multa/juros já usada na receita anterior (pode ter sido
    // ajustada manualmente pra esse inquilino/contrato) -- só recai no
    // padrão do locador se a anterior nunca teve nenhum valor definido.
    let multaValor = receita.multaValor;
    let jurosValor = receita.jurosValor;
    if (multaValor == null && jurosValor == null) {
      const padrao = await multaJurosPadrao(receita.locadorId);
      multaValor = padrao.multaValor;
      jurosValor = padrao.jurosValor;
    }

    await prisma.receita.create({
      data: {
        inquilinoId: receita.inquilinoId,
        locadorId: receita.locadorId,
        pagadorNome: receita.pagadorNome,
        pagadorCpf: receita.pagadorCpf,
        pagadorEmail: receita.pagadorEmail,
        pagadorTelefone: receita.pagadorTelefone,
        categoria: receita.categoria,
        descricao: descricaoProximoMes(receita.descricao, proximoVencimento),
        valor: receita.valor,
        valorLiquido,
        vencimento: proximoVencimento,
        status: "PENDENTE",
        recorrente: true,
        multaValor,
        jurosValor,
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
