const prisma = require("../config/prisma");

const listar = async () => {
  return prisma.configuracao.findMany({
    orderBy: {
      id: "asc",
    },
  });
};

const buscarPorId = async (id) => {
  return prisma.configuracao.findUnique({
    where: {
      id: Number(id),
    },
  });
};

// Só campos de marca/aparência — nunca tokens/chaves de integração.
// Usado pela tela de login e pelo tema, que precisam ler isso sem
// estar autenticados.
const buscarPublica = async () => {
  const configuracao = await prisma.configuracao.findFirst({
    orderBy: { id: "asc" },
  });

  return {
    tema: configuracao?.tema || "claro",
    corPrimaria: configuracao?.corPrimaria || "#F4C430",
    corSecundaria: configuracao?.corSecundaria || "#1F2937",
    nomeSistema: configuracao?.nomeSistema || null,
    nomeEmpresa: configuracao?.nomeEmpresa || null,
    textoLogin: configuracao?.textoLogin || null,
    textoRodape: configuracao?.textoRodape || null,
    mensagemBoasVindas: configuracao?.mensagemBoasVindas || null,
  };
};

const criar = async (dados) => {
  return prisma.configuracao.create({
    data: dados,
  });
};

const atualizar = async (id, dados) => {
  return prisma.configuracao.update({
    where: {
      id: Number(id),
    },
    data: dados,
  });
};

const excluir = async (id) => {
  return prisma.configuracao.delete({
    where: {
      id: Number(id),
    },
  });
};

module.exports = {
  listar,
  buscarPorId,
  buscarPublica,
  criar,
  atualizar,
  excluir,
};