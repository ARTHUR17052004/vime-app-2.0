const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");
const { MS_LIMITE, MS_DIA, calcularAlerta } = require("../utils/prazoAlerta");

// Status finais -- solicitação resolvida ou rejeitada não conta mais
// (mesmo espírito de "sai de DISPONIVEL" nas kitnets).
const STATUS_ENCERRADOS = ["ATENDIDA", "REJEITADA"];

// Mesmo padrão de verificarKitnetsVaziasJob.js, mas o "desde" aqui é
// direto o campo prazo da própria solicitação -- não precisa de uma
// extensão do Prisma pra sincronizar nada: se o prazo for editado, a
// conta já parte do valor novo sozinha. 72h de tolerância depois do
// prazo vencido, depois disso dia 1, dia 2, dia 3... (ver
// utils/prazoAlerta.js).
module.exports = async () => {

  console.log("[JOB] Verificando solicitações com prazo vencido há mais de 72h...");

  const agora = new Date();
  const limite = new Date(agora.getTime() - MS_LIMITE);

  const candidatas = await prisma.solicitacao.findMany({
    where: {
      status: { notIn: STATUS_ENCERRADOS },
      prazo: { not: null, lte: limite },
    },
  });

  let alertadas = 0;

  for (const solicitacao of candidatas) {

    const jaAlertouHoje = solicitacao.ultimoAlertaPrazoEm &&
      (agora.getTime() - new Date(solicitacao.ultimoAlertaPrazoEm).getTime()) < MS_DIA;

    if (jaAlertouHoje) continue;

    const { dias } = calcularAlerta(solicitacao.prazo, agora);

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Solicitação com prazo vencido",
      mensagem: `A solicitação "${solicitacao.titulo}" (${solicitacao.numero}) está com o prazo vencido há ${dias} dia(s) sem ser atendida.`,
      link: `/solicitacoes/${solicitacao.id}`,
    });

    await prisma.solicitacao.update({
      where: { id: solicitacao.id },
      data: { ultimoAlertaPrazoEm: agora },
    });

    alertadas++;

  }

  console.log(`[JOB] ${candidatas.length} solicitação(ões) com prazo vencido há mais de 72h, ${alertadas} alerta(s) enviado(s).`);

};
