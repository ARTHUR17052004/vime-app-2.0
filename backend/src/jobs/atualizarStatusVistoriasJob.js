const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

// Linha do tempo de uma vistoria, sozinha: Programada -> Pendente ->
// Atrasada, contando do prazo (dataProxima) pra trás e pra frente --
// nada disso mexe em quem já foi Realizada/Cancelada.
//  - Pendente: faltam 72h ou menos pro prazo.
//  - Atrasada: o prazo já venceu e continua sem resposta (sem ter sido
//    Realizada, o que já troca o status e marca a próxima data -- ver
//    vistoriaService.atualizar/concluirMissoes).
// Cada entrada NOVA num status manda uma notificação na hora (lembrete
// diário de quem continua parado é com lembrarVistoriasPendentesJob.js
// e verificarVistoriasAtrasadasJob.js).
const MS_72H = 72 * 60 * 60 * 1000;

const localDe = (vistoria) =>
  vistoria.kitnet?.nome || vistoria.kitnet?.numero
    ? `Kitnet ${vistoria.kitnet.nome || vistoria.kitnet.numero}`
    : vistoria.unidade?.nome || "residência";

module.exports = async () => {

  console.log("[JOB] Atualizando status das vistorias (Programada -> Pendente -> Atrasada)...");

  const agora = new Date();
  const limitePendente = new Date(agora.getTime() + MS_72H);

  const paraPendente = await prisma.vistoria.findMany({
    where: {
      status: "PROGRAMADA",
      dataProxima: { not: null, lte: limitePendente },
    },
    include: { unidade: true, kitnet: true },
  });

  for (const vistoria of paraPendente) {

    await prisma.vistoria.update({
      where: { id: vistoria.id },
      data: { status: "PENDENTE" },
    });

    try {
      const prazo = new Date(vistoria.dataProxima).toLocaleDateString("pt-BR");
      await notificacaoService.criar({
        origem: "SISTEMA",
        titulo: "Vistoria pendente",
        mensagem: await notificacaoService.renderizarMensagem(
          'VISTORIA_PENDENTE',
          { titulo: vistoria.titulo, local: localDe(vistoria), prazo },
          `🕒 A vistoria "${vistoria.titulo}" (${localDe(vistoria)}) entrou no prazo -- faltam menos de 72h para ${prazo}.`
        ),
        link: `/vistorias/${vistoria.id}`,
      });
    } catch (erro) {
      console.error("[notificacao] Falha ao avisar vistoria pendente:", erro.message);
    }

  }

  const paraAtrasada = await prisma.vistoria.findMany({
    where: {
      status: { in: ["PROGRAMADA", "PENDENTE"] },
      dataProxima: { not: null, lte: agora },
    },
    include: { unidade: true, kitnet: true },
  });

  for (const vistoria of paraAtrasada) {

    await prisma.vistoria.update({
      where: { id: vistoria.id },
      data: { status: "ATRASADA", ultimoAlertaAtrasadaEm: agora },
    });

    try {
      await notificacaoService.criar({
        origem: "SISTEMA",
        titulo: "Vistoria atrasada",
        mensagem: await notificacaoService.renderizarMensagem(
          'VISTORIA_ATRASADA',
          { titulo: vistoria.titulo, local: localDe(vistoria), dias: 0 },
          `⏰ A vistoria "${vistoria.titulo}" (${localDe(vistoria)}) venceu e ainda não foi realizada.`
        ),
        link: `/vistorias/${vistoria.id}`,
      });
    } catch (erro) {
      console.error("[notificacao] Falha ao avisar vistoria atrasada:", erro.message);
    }

  }

  console.log(`[JOB] ${paraPendente.length} vistoria(s) -> PENDENTE, ${paraAtrasada.length} vistoria(s) -> ATRASADA.`);

};
