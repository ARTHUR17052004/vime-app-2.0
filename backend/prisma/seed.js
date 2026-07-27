const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {

  const admin = await prisma.usuario.findUnique({
    where: {
      email: 'admin@vime.com'
    }
  });

  if (admin) {
    console.log('✔ Administrador já cadastrado.');
    return;
  }

  const senhaCriptografada = await bcrypt.hash('123456', 10);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@vime.com',
      senha: senhaCriptografada,
      perfil: 'ADMINISTRADOR',
      ativo: true
    }
  });

  console.log('✔ Administrador criado com sucesso.');

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });