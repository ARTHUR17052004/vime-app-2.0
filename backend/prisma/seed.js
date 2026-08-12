const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Cria o perfil Administrador se não existir
  let perfil = await prisma.perfil.findUnique({
    where: {
      nome: "ADMINISTRADOR",
    },
  });

  if (!perfil) {
    perfil = await prisma.perfil.create({
      data: {
        nome: "ADMINISTRADOR",
        descricao: "Administrador do sistema",
        ativo: true,
      },
    });
  }

  // Verifica se o usuário já existe
  const admin = await prisma.usuario.findUnique({
    where: {
      email: "admin@vime.com",
    },
  });

  if (admin) {
    console.log("✔ Administrador já cadastrado.");
    return;
  }

  const senha = await bcrypt.hash("123456", 10);

  await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@vime.com",
      senha,
      ativo: true,
      perfilId: perfil.id,
    },
  });

  console.log("✔ Administrador criado com sucesso.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });