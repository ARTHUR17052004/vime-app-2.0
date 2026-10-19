const prisma = require("../config/prisma");

// Linha do tempo de uma vistoria, sozinha: Programada -> Pendente ->
// Atrasada, contando do prazo (dataProxima) pra trás e pra frente --
// nada disso mexe em quem já foi Realizada/Cancelada.
//  - Pendente: faltam 72h ou menos pro prazo.
//  - Atrasada: o prazo já venceu e continua sem resposta (sem ter sido
//    Realizada, o que já troca o status e marca a próxima data -- ver
//    vistoriaService.atualizar/concluirMissoes).
const MS_72H = 72 * 60 * 60 * 1000;

module.exports = async () => {

  console.log("[JOB] Atualizando status das vistorias (Programada -> Pendente -> Atrasada)...");

  const agora = new Date();
  const limitePendente = new Date(agora.getTime() + MS_72H);

  const paraPendente = await prisma.vistoria.updateMany({
    where: {
      status: "PROGRAMADA",
      dataProxima: { not: null, lte: limitePendente },
    },
    data: { status: "PENDENTE" },
  });

  const paraAtrasada = await prisma.vistoria.updateMany({
    where: {
      status: { in: ["PROGRAMADA", "PENDENTE"] },
      dataProxima: { not: null, lte: agora },
    },
    data: { status: "ATRASADA" },
  });

  console.log(`[JOB] ${paraPendente.count} vistoria(s) -> PENDENTE, ${paraAtrasada.count} vistoria(s) -> ATRASADA.`);

};
