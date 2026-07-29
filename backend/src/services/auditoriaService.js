const prisma = require("../config/prisma");

const registrar = async ({
  usuarioId = null,
  usuarioNome = null,
  modulo,
  registroId = null,
  acao,
  valorAnterior = null,
  valorNovo = null,
  ip = null
}) => {

  return prisma.auditoria.create({
    data: {
      usuarioId,
      usuarioNome,
      modulo,
      registroId,
      acao,
      valorAnterior,
      valorNovo,
      ip
    }
  });

};

module.exports = {
  registrar
};