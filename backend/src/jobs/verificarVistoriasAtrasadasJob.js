const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");
const { MS_LIMITE, MS_DIA, calcularAlerta } = require("../utils/prazoAlerta");

// Realizada ou cancelada não conta mais.
const STATUS_ENCERRADOS = ["REALIZADA", "CANCELADA"];

// Mesmo padrão de verificarKitnetsVaziasJob.js, mas o "desde" aqui é
// direto o campo dataProxima da própria vistoria -- se a periodicidade
// recalcular essa data (ou alguém editar na mão), a conta já parte do
// valor novo sozinha. 72h de tolerância depois da data vencida, depois
// disso dia 1, dia 2, dia 3... (ver utils/prazoAlerta.js).
module.exports = async () => {

  console.log("[JOB] Verificando vistorias atrasadas há mais de 72h...");

  const agora = new Date();
  const limite = new Date(agora.getTime() - MS_LIMITE);

  const candidatas = await prisma.vistoria.findMany({
    where: {
      status: { notIn: STATUS_ENCERRADOS },
      dataProxima: { not: null, lte: limite },
    },
    include: { unidade: true, kitnet: true },
  });

  let alertadas = 0;

  for (const vistoria of candidatas) {

    const jaAlertouHoje = vistoria.ultimoAlertaAtrasadaEm &&
      (agora.getTime() - new Date(vistoria.ultimoAlertaAtrasadaEm).getTime()) < MS_DIA;

    if (jaAlertouHoje) continue;

    const { dias } = calcularAlerta(vistoria.dataProxima, agora);

    const local = vistoria.kitnet?.nome || vistoria.kitnet?.numero
      ? `Kitnet ${vistoria.kitnet.nome || vistoria.kitnet.numero}`
      : vistoria.unidade?.nome || "residência";

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Vistoria atrasada",
      mensagem: `A vistoria "${vistoria.titulo}" (${local}) está atrasada há ${dias} dia(s) sem ser realizada.`,
      link: `/vistorias/${vistoria.id}`,
    });

    await prisma.vistoria.update({
      where: { id: vistoria.id },
      data: { ultimoAlertaAtrasadaEm: agora },
    });

    alertadas++;

  }

  console.log(`[JOB] ${candidatas.length} vistoria(s) atrasada(s) há mais de 72h, ${alertadas} alerta(s) enviado(s).`);

};
