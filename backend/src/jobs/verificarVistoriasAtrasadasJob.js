const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

// Lembrete diário de quem continua Atrasada sem resposta (a notificação
// do momento em que venceu já saiu na hora, ver
// atualizarStatusVistoriasJob.js) -- status é a fonte da verdade agora,
// não precisa mais recalcular "quanto tempo passou do prazo" aqui.
const MS_DIA = 24 * 60 * 60 * 1000;

module.exports = async () => {

  console.log("[JOB] Lembrando vistorias atrasadas...");

  const agora = new Date();

  const atrasadas = await prisma.vistoria.findMany({
    where: { status: "ATRASADA" },
    include: { unidade: true, kitnet: true },
  });

  let alertadas = 0;

  for (const vistoria of atrasadas) {

    const jaAlertouHoje = vistoria.ultimoAlertaAtrasadaEm &&
      (agora.getTime() - new Date(vistoria.ultimoAlertaAtrasadaEm).getTime()) < MS_DIA;

    if (jaAlertouHoje) continue;

    const dias = Math.max(
      1,
      Math.floor((agora.getTime() - new Date(vistoria.dataProxima).getTime()) / MS_DIA)
    );

    const local = vistoria.kitnet?.nome || vistoria.kitnet?.numero
      ? `Kitnet ${vistoria.kitnet.nome || vistoria.kitnet.numero}`
      : vistoria.unidade?.nome || "residência";

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Vistoria atrasada",
      mensagem: `⏰ Psst! A vistoria "${vistoria.titulo}" (${local}) já passou do prazo há ${dias} dia(s). Dá um tempinho pra resolver isso hoje?`,
      link: `/vistorias/${vistoria.id}`,
    });

    await prisma.vistoria.update({
      where: { id: vistoria.id },
      data: { ultimoAlertaAtrasadaEm: agora },
    });

    alertadas++;

  }

  console.log(`[JOB] ${atrasadas.length} vistoria(s) atrasada(s), ${alertadas} alerta(s) enviado(s).`);

};
