const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

/*
  Lembrete da janela de revisão entre a emissão (dia 20) e o disparo
  automático ao banco (dia 01) -- ver gerarCobrancasRecorrentesJob.js e
  dispararReceitasBancoJob.js.

  Roda todo dia (dentro do lote das 8h); só faz alguma coisa nos dois
  dias exatos em que falta 5 dias ou 24 horas pro próximo dia 01 --
  como esses marcos só batem uma vez por mês cada, não precisa de
  dedupe por data (diferente do lembrete de vencimento de contrato, que
  pode bater o marco mais de uma vez se o job ficar fora do ar).
*/

const MARCOS = [
  { dias: 5, prazo: "em 5 dias", titulo: "DISPARO DE COBRANÇAS EM 5 DIAS" },
  { dias: 1, prazo: "em 24 horas", titulo: "DISPARO DE COBRANÇAS EM 24 HORAS" },
];

const diasAteProximoDia1 = (hoje) => {
  const inicioDeHoje = new Date(hoje);
  inicioDeHoje.setHours(0, 0, 0, 0);
  const proximoDia1 = new Date(inicioDeHoje.getFullYear(), inicioDeHoje.getMonth() + 1, 1);
  return Math.round((proximoDia1 - inicioDeHoje) / (1000 * 60 * 60 * 24));
};

module.exports = async () => {

  const hoje = new Date();
  const diasRestantes = diasAteProximoDia1(hoje);

  const marco = MARCOS.find((m) => m.dias === diasRestantes);

  if (!marco) return;

  const fimDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  fimDoMes.setHours(23, 59, 59, 999);

  const pendentes = await prisma.receita.findMany({
    where: {
      categoria: "Aluguel",
      contratoId: { not: null },
      status: { in: ["PENDENTE", "ATRASADA"] },
      gatewayReferencia: null,
      vencimento: { lte: fimDoMes },
      // Mesmo filtro do dispararReceitasBancoJob -- contrato Encerrado
      // ou Pendente nunca entra no disparo automático, então também não
      // deve contar nesse aviso (senão o "faltam X cobranças" fica maior
      // do que o que realmente vai sair no dia 01).
      contrato: { status: "ATIVO" },
    },
    select: {
      locadorId: true,
      contrato: { select: { locadorId: true } },
    },
  });

  const porLocador = new Map();

  for (const receita of pendentes) {
    const locadorId = receita.locadorId || receita.contrato?.locadorId;
    if (!locadorId) continue;
    porLocador.set(locadorId, (porLocador.get(locadorId) || 0) + 1);
  }

  console.log(`[JOB] Aviso de disparo de receitas: faltam ${diasRestantes} dia(s) -- ${pendentes.length} pendente(s) no total.`);

  for (const [locadorId, quantidade] of porLocador.entries()) {

    try {

      // Dedupe: se o job já mandou esse aviso hoje (reinício do
      // servidor, cron duplicado) não manda de novo.
      const jaNotificado = await prisma.notificacao.findFirst({
        where: {
          titulo: marco.titulo,
          locadorId,
          createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) },
        },
      });

      if (jaNotificado) continue;

      await notificacaoService.criar({
        origem: "SISTEMA",
        titulo: marco.titulo,
        mensagem: await notificacaoService.renderizarMensagem(
          "DISPARO_RECEITAS_PROXIMO",
          { prazo: marco.prazo, quantidade: String(quantidade) },
          `Faltam ${marco.prazo} para o disparo automático de ${quantidade} cobrança(s) de aluguel aos bancos. Revise/edite o que precisar no Financeiro antes do dia 01.`
        ),
        link: "/financeiro",
        locadorId,
      });

    } catch (erro) {
      console.error(`[JOB] Erro ao avisar locador ${locadorId} sobre disparo próximo:`, erro.message);
    }

  }

};
