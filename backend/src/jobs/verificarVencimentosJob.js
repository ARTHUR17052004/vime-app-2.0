const prisma = require("../config/prisma");

module.exports = async () => {

  console.log("[JOB] Verificando vencimentos...");

  const hoje = new Date();

  const receitas = await prisma.receita.findMany({
    where: {
      status: "PENDENTE",
      vencimento: {
        lt: hoje
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

};