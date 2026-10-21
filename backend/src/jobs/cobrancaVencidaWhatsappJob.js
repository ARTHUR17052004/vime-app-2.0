const prisma = require("../config/prisma");
const whatsappAutomacaoService = require("../services/whatsappAutomacaoService");

/*
  Aviso de cobrança vencida (via WhatsApp).

  Roda depois do verificarVencimentosJob (que já vira PENDENTE -> ATRASADA),
  então pega toda Receita já marcada ATRASADA que ainda não recebeu o
  aviso. Dispara UMA vez por cobrança -- `Receita.avisoVencidoEnviadoEm`
  evita reenviar todo dia enquanto ela continuar vencida.

  A marca é reivindicada no banco (updateMany atômico) ANTES de mandar,
  não depois -- evita duas execuções do job quase simultâneas mandando
  o mesmo aviso duas vezes (ver mesma correção em lembreteVencimentoJob.js).
*/

module.exports = async () => {
  console.log("[JOB] Verificando cobranças vencidas (WhatsApp)...");

  const receitas = await prisma.receita.findMany({
    where: {
      status: "ATRASADA",
      avisoVencidoEnviadoEm: null,
    },
    include: {
      contrato: {
        include: { inquilino: true },
      },
      inquilino: true,
    },
  });

  let enviados = 0;
  let ignorados = 0;

  for (const receita of receitas) {
    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (!inquilino?.telefone) {
      ignorados++;
      continue;
    }

    const reivindicada = await prisma.receita.updateMany({
      where: { id: receita.id, avisoVencidoEnviadoEm: null },
      data: { avisoVencidoEnviadoEm: new Date() },
    });

    if (reivindicada.count === 0) {
      ignorados++;
      continue;
    }

    try {
      const resultado = await whatsappAutomacaoService.notificarCobrancaVencida(receita, inquilino);

      if (!resultado.success) {
        await prisma.receita.update({
          where: { id: receita.id },
          data: { avisoVencidoEnviadoEm: null },
        });
        ignorados++;
        continue;
      }

      enviados++;
    } catch (error) {
      await prisma.receita.update({
        where: { id: receita.id },
        data: { avisoVencidoEnviadoEm: null },
      });
      console.error(
        `[JOB] Falha ao enviar aviso de atraso da receita ${receita.id}:`,
        error.message
      );
    }
  }

  console.log(
    `[JOB] Cobranças vencidas: ${enviados} avisados, ${ignorados} ignorados (${receitas.length} candidatas).`
  );

  return { enviados, ignorados, total: receitas.length };
};
