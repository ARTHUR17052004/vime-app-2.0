const prisma = require("../config/prisma");
const whatsappService = require("../services/whatsappService");

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
  do servidor). Guardamos a data/hora do último envio e só disparamos
  de novo se ainda não foi enviado nesse mesmo dia.
*/

const DIAS_ANTECEDENCIA = 3;

function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
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
    },
  });

  let enviados = 0;
  let ignorados = 0;

  for (const receita of receitas) {
    const telefone = receita.contrato?.inquilino?.telefone;

    if (!telefone) {
      ignorados++;
      continue;
    }

    // já enviamos um lembrete hoje para essa receita? não reenvia.
    if (
      receita.lembreteEnviadoEm &&
      inicioDoDia(receita.lembreteEnviadoEm).getTime() === hoje.getTime()
    ) {
      ignorados++;
      continue;
    }

    const venceHoje =
      inicioDoDia(receita.vencimento).getTime() === hoje.getTime();

    const nomeInquilino = receita.contrato?.inquilino?.nome || "Inquilino";
    const dataFormatada = new Date(receita.vencimento).toLocaleDateString(
      "pt-BR"
    );
    const valorFormatado = formatarMoeda(receita.valor);

    const mensagem = venceHoje
      ? `Olá, ${nomeInquilino}! Passando para lembrar que sua cobrança de ${valorFormatado} (${receita.descricao}) vence HOJE, ${dataFormatada}. Evite atrasos e regularize o quanto antes.`
      : `Olá, ${nomeInquilino}! Sua cobrança de ${valorFormatado} (${receita.descricao}) vence em ${dataFormatada}. Fique atento para evitar juros e multa por atraso.`;

    try {
      await whatsappService.enviarMensagem({
        numero: telefone,
        mensagem,
      });

      await prisma.receita.update({
        where: { id: receita.id },
        data: { lembreteEnviadoEm: new Date() },
      });

      enviados++;
    } catch (error) {
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
