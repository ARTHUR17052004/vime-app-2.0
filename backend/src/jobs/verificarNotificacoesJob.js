const prisma = require("../config/prisma");

module.exports = async () => {

  console.log("[JOB] Verificando notificações...");

  const notificacoes = await prisma.notificacao.findMany({
    where: {
      lida: false
    }
  });

  console.log(
    `${notificacoes.length} notificação(ões) pendente(s).`
  );

  for (const notificacao of notificacoes) {

  console.log(
    `[NOTIFICAÇÃO] ${notificacao.id}`
  );

}

};