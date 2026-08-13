const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modelos = [
  'ocorrencia',
  'vistoria',
  'receita',
  'despesa',
  'contrato',
  'inquilino',
  'kitnet',
  'unidade',
  'locador'
];

(async () => {
  const antes = {};
  for (const modelo of modelos) {
    antes[modelo] = await prisma[modelo].count();
  }
  console.log('Registros antes da limpeza:', antes);

  for (const modelo of modelos) {
    await prisma[modelo].deleteMany({});
  }

  const depois = {};
  for (const modelo of modelos) {
    depois[modelo] = await prisma[modelo].count();
  }
  console.log('Registros depois da limpeza:', depois);

  await prisma.$disconnect();
})();
