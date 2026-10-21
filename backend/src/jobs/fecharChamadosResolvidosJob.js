const prisma = require("../config/prisma");
const logService = require("../services/logService");
const auditoriaService = require("../services/auditoriaService");

/*
  Fecha sozinho um chamado de suporte que está RESOLVIDO há mais de 24h
  sem ninguém reabrir -- regra pedida pelo usuário. `Chamado.resolvidoEm`
  é gravado só no instante em que o status entra em RESOLVIDO (ver
  chamadoService.atualizar e chamadoMensagemService.criar) e limpo se
  for reaberto, então não precisa vasculhar a auditoria pra saber há
  quanto tempo está assim.

  Reivindica cada chamado (updateMany com WHERE ainda-RESOLVIDO-com-o-
  mesmo-resolvidoEm) antes de fechar -- mesmo padrão usado nos jobs de
  aviso por WhatsApp, evita fechar duas vezes se o job rodar mais de
  uma vez perto do mesmo horário.
*/

const MS_24H = 24 * 60 * 60 * 1000;

module.exports = async () => {

  console.log("[JOB] Fechando chamados resolvidos há mais de 24h...");

  const limite = new Date(Date.now() - MS_24H);

  const candidatos = await prisma.chamado.findMany({
    where: {
      status: "RESOLVIDO",
      resolvidoEm: { not: null, lte: limite },
    },
  });

  let fechados = 0;

  for (const chamado of candidatos) {

    const reivindicado = await prisma.chamado.updateMany({
      where: {
        id: chamado.id,
        status: "RESOLVIDO",
        resolvidoEm: chamado.resolvidoEm,
      },
      data: { status: "FECHADO" },
    });

    if (reivindicado.count === 0) continue;

    await auditoriaService.registrar({
      usuarioId: null,
      usuarioNome: "Sistema",
      modulo: "SUPORTE",
      registroId: chamado.id,
      acao: "ATUALIZAR",
      valorAnterior: chamado,
      valorNovo: { ...chamado, status: "FECHADO" },
    });

    await logService.registrar({
      usuarioId: null,
      usuarioNome: "Sistema",
      modulo: "SUPORTE",
      acao: "ATUALIZAR",
      descricao: `Chamado "${chamado.titulo}" (${chamado.numero}) fechado automaticamente -- resolvido há mais de 24h sem ser reaberto.`,
    });

    fechados++;

  }

  console.log(`[JOB] ${candidatos.length} chamado(s) resolvido(s) há mais de 24h, ${fechados} fechado(s).`);

  return { fechados, total: candidatos.length };

};
