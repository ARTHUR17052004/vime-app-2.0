const prisma = require("../config/prisma");

module.exports = async () => {

  console.log("[JOB] Verificando cobranças...");

  const pendentes = await prisma.receita.count({
    where: {
      status: "PENDENTE"
    }
  });

  const vencidas = await prisma.receita.count({
  where: {
    status: "VENCIDA"
  }
});

console.log(`${vencidas} cobrança(s) vencida(s).`);

  console.log(
    `${pendentes} cobrança(s) pendente(s).`
  );

};