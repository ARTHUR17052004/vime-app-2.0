const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

const HORAS_LIMITE = 24;
const MS_LIMITE = HORAS_LIMITE * 60 * 60 * 1000;
const MS_DIA = 24 * 60 * 60 * 1000;

// Roda 1x por dia (ver jobs/index.js) -- "notificação de 24 em 24
// horas" cai direto nesse cron diário, sem precisar de agendamento à
// parte. kitnet.vazioDesde é mantido sozinho pela extensão do Prisma
// Client (ver config/prisma.js) toda vez que o status muda pra/de
// DISPONIVEL, então aqui só falta achar quem já passou de 24h sem
// alertar nas últimas ~24h.
module.exports = async () => {

  console.log("[JOB] Verificando kitnets vazias há mais de 24h...");

  const agora = new Date();
  const limite = new Date(agora.getTime() - MS_LIMITE);

  const candidatas = await prisma.kitnet.findMany({
    where: {
      status: "DISPONIVEL",
      vazioDesde: { not: null, lte: limite },
    },
    include: { unidade: true },
  });

  let alertadas = 0;

  for (const kitnet of candidatas) {

    const jaAlertouHoje = kitnet.ultimoAlertaVaziaEm &&
      (agora.getTime() - new Date(kitnet.ultimoAlertaVaziaEm).getTime()) < MS_DIA;

    if (jaAlertouHoje) continue;

    const decorridoMs = agora.getTime() - new Date(kitnet.vazioDesde).getTime();
    const dias = Math.floor(decorridoMs / MS_DIA);

    const nomeKitnet = kitnet.nome || `Kitnet ${kitnet.numero}`;
    const nomeUnidade = kitnet.unidade?.nome || "residência";

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Kitnet vazia",
      mensagem: `${nomeKitnet} (${nomeUnidade}) está vazia há ${dias} dia(s) sem ser locada.`,
      link: `/kitnets/${kitnet.id}`,
    });

    await prisma.kitnet.update({
      where: { id: kitnet.id },
      data: { ultimoAlertaVaziaEm: agora },
    });

    alertadas++;

  }

  console.log(`[JOB] ${candidatas.length} kitnet(s) vazia(s) há mais de 24h, ${alertadas} alerta(s) enviado(s).`);

};
