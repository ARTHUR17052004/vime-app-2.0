const prisma = require("../config/prisma");
const { emitirAtualizacao } = require("../socket");

module.exports = async () => {

  console.log("[JOB] Verificando vencimentos...");

  // Só conta como atrasada a partir do dia SEGUINTE ao vencimento -- no
  // próprio dia do vencimento ainda é "Pendente" (com o lembrete D-0 de
  // lembreteVencimentoJob.js). Antes comparava com `new Date()` (hora
  // atual), então qualquer cobrança vencendo HOJE já virava "Atrasada"
  // a partir da meia-noite, mesmo faltando o dia inteiro pra vencer de
  // verdade -- bug relatado em 10/11/2026.
  const inicioDeHoje = new Date();
  inicioDeHoje.setHours(0, 0, 0, 0);

  const receitas = await prisma.receita.findMany({
    where: {
      status: "PENDENTE",
      vencimento: {
        lt: inicioDeHoje
      }
    }
  });

 for (const receita of receitas) {

  await prisma.receita.update({
    where: {
      id: receita.id
    },
    data: {
      status: "ATRASADA"
    }
  });

}

  if (receitas.length > 0) {
    emitirAtualizacao("receita");
  }

};