const prisma = require("../config/prisma");

const registrar = async ({
  usuarioId,
  usuarioNome,
  modulo,
  acao,
  descricao,
  ip,
}) => {

  return prisma.logSistema.create({
    data: {
      usuarioId,
      usuarioNome,
      modulo,
      acao,
      descricao,
      ip,
    },
  });

};

const listar = () => {

  return prisma.logSistema.findMany({

    orderBy: {
      createdAt: "desc",
    },

  });

};

module.exports = {
  registrar,
  listar,
};