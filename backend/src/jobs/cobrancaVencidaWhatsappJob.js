const prisma = require("../config/prisma");
const whatsappAutomacaoService = require("../services/whatsappAutomacaoService");

/*
  Aviso de cobrança vencida (via WhatsApp).

  Roda depois do verificarVencimentosJob (que já vira PENDENTE -> ATRASADA),
  então pega toda Receita já marcada ATRASADA que ainda não recebeu o
  aviso. Dispara UMA vez por cobrança -- `Receita.avisoVencidoEnviadoEm`
  evita reenviar todo dia enquanto ela continuar vencida.
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

    try {
      const resultado = await whatsappAutomacaoService.notificarCobrancaVencida(receita, inquilino);

      if (!resultado.success) {
        ignorados++;
        continue;
      }

      await prisma.receita.update({
        where: { id: receita.id },
        data: { avisoVencidoEnviadoEm: new Date() },
      });

      enviados++;
    } catch (error) {
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
