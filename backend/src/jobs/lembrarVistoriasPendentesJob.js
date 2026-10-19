const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

// Lembrete diário de quem continua Pendente sem resposta (a notificação
// da entrada nessa janela de 72h já saiu na hora, ver
// atualizarStatusVistoriasJob.js) -- mesmo padrão de
// verificarVistoriasAtrasadasJob.js, um lembrete por dia por vistoria.
const MS_DIA = 24 * 60 * 60 * 1000;

const localDe = (vistoria) =>
  vistoria.kitnet?.nome || vistoria.kitnet?.numero
    ? `Kitnet ${vistoria.kitnet.nome || vistoria.kitnet.numero}`
    : vistoria.unidade?.nome || "residência";

module.exports = async () => {

  console.log("[JOB] Lembrando vistorias pendentes...");

  const agora = new Date();

  const pendentes = await prisma.vistoria.findMany({
    where: { status: "PENDENTE" },
    include: { unidade: true, kitnet: true },
  });

  let avisadas = 0;

  for (const vistoria of pendentes) {

    const jaAvisouHoje = vistoria.ultimoAlertaPendenteEm &&
      (agora.getTime() - new Date(vistoria.ultimoAlertaPendenteEm).getTime()) < MS_DIA;

    if (jaAvisouHoje) continue;

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Vistoria pendente",
      mensagem: `🕒 Psst! A vistoria "${vistoria.titulo}" (${localDe(vistoria)}) continua pendente -- o prazo é ${new Date(vistoria.dataProxima).toLocaleDateString("pt-BR")}.`,
      link: `/vistorias/${vistoria.id}`,
    });

    await prisma.vistoria.update({
      where: { id: vistoria.id },
      data: { ultimoAlertaPendenteEm: agora },
    });

    avisadas++;

  }

  console.log(`[JOB] ${pendentes.length} vistoria(s) pendente(s), ${avisadas} lembrete(s) enviado(s).`);

};
