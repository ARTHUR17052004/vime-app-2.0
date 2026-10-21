const prisma = require("../config/prisma");
const whatsappAutomacaoService = require("../services/whatsappAutomacaoService");

/*
  Lembrete automático de vencimento (via WhatsApp).

  Regra de disparo (definida aqui por não haver especificação de negócio
  mais detalhada — documentando a escolha):
  - Receitas PENDENTES cujo vencimento é HOJE, ou daqui a exatamente
    `DIAS_ANTECEDENCIA` dias (3 dias por padrão).
  Isso gera no máximo 2 lembretes por cobrança ao longo do ciclo
  (D-3 e D-0), evitando spam diário.

  Duplicidade: usamos `Receita.lembreteEnviadoEm` para não reenviar o
  lembrete no mesmo dia caso o job rode mais de uma vez (ex.: reinício
  do servidor, ou o cron disparando duas vezes perto uma da outra --
  já aconteceu). Só checar e mandar pra DEPOIS gravar não é seguro:
  duas execuções quase simultâneas podem passar pela checagem ANTES de
  qualquer uma gravar, e as duas mandam a mensagem (foi o que causou o
  lembrete duplicado em 21/10/2026). Por isso a marca é "reivindicada"
  no banco de forma atômica (updateMany com WHERE ainda-não-enviado-
  hoje) ANTES de mandar -- só quem realmente ganhar a corrida chega a
  enviar; se o envio falhar depois, devolve a reivindicação pra não
  perder a tentativa de amanhã.
*/

const DIAS_ANTECEDENCIA = 3;

function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = async () => {
  console.log("[JOB] Verificando lembretes de vencimento...");

  const hoje = inicioDoDia(new Date());

  const fimHoje = new Date(hoje);
  fimHoje.setHours(23, 59, 59, 999);

  const dataAntecedencia = new Date(hoje);
  dataAntecedencia.setDate(dataAntecedencia.getDate() + DIAS_ANTECEDENCIA);
  const fimAntecedencia = new Date(dataAntecedencia);
  fimAntecedencia.setHours(23, 59, 59, 999);

  const receitas = await prisma.receita.findMany({
    where: {
      status: "PENDENTE",
      vencimento: { not: null },
      OR: [
        { vencimento: { gte: hoje, lte: fimHoje } },
        { vencimento: { gte: dataAntecedencia, lte: fimAntecedencia } },
      ],
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

    // Reivindica a receita ANTES de mandar (não depois) -- atômico no
    // banco, então se duas execuções do job caírem aqui ao mesmo tempo,
    // só uma consegue casar o WHERE e seguir em frente.
    const agoraDoEnvio = new Date();

    const reivindicada = await prisma.receita.updateMany({
      where: {
        id: receita.id,
        OR: [
          { lembreteEnviadoEm: null },
          { lembreteEnviadoEm: { lt: hoje } },
        ],
      },
      data: { lembreteEnviadoEm: agoraDoEnvio },
    });

    if (reivindicada.count === 0) {
      ignorados++;
      continue;
    }

    try {
      const resultado = await whatsappAutomacaoService.notificarLembreteVencimento(receita, inquilino);

      if (!resultado.success) {
        // Não conseguiu mandar de verdade -- devolve a reivindicação
        // pra não perder a chance de tentar de novo amanhã.
        await prisma.receita.update({
          where: { id: receita.id },
          data: { lembreteEnviadoEm: receita.lembreteEnviadoEm },
        });
        ignorados++;
        continue;
      }

      enviados++;
    } catch (error) {
      await prisma.receita.update({
        where: { id: receita.id },
        data: { lembreteEnviadoEm: receita.lembreteEnviadoEm },
      });
      console.error(
        `[JOB] Falha ao enviar lembrete da receita ${receita.id}:`,
        error.message
      );
    }
  }

  console.log(
    `[JOB] Lembretes de vencimento: ${enviados} enviados, ${ignorados} ignorados (${receitas.length} candidatas).`
  );

  return { enviados, ignorados, total: receitas.length };
};
