const prisma = require("../config/prisma");

const buscarPorTipo = (tipo) => {

  return prisma.modeloDocumento.findUnique({
    where: { tipo },
  });

};

const listar = () => {

  return prisma.modeloDocumento.findMany({
    orderBy: { tipo: "asc" },
  });

};

const salvar = async (tipo, dados) => {

  return prisma.modeloDocumento.upsert({
    where: { tipo },
    update: {
      conteudo: dados.conteudo,
      nomeArquivo: dados.nomeArquivo,
    },
    create: {
      tipo,
      conteudo: dados.conteudo,
      nomeArquivo: dados.nomeArquivo,
    },
  });

};

module.exports = {
  buscarPorTipo,
  listar,
  salvar,
};
