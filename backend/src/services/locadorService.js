const prisma = require("../config/prisma");
const campoObrigatorioService = require("./campoObrigatorioService");

const listar = () => {
  return prisma.locador.findMany({
    include: {
      unidades: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const criar = async (dados) => {

  await campoObrigatorioService.validar('locador', dados);

  return prisma.locador.create({
    data: {
      tipoPessoa: dados.tipoPessoa,
      nome: dados.nome,
      cpfCnpj: dados.documento,
      email: dados.email,
      telefone: dados.telefone,
      banco: dados.banco,
      agencia: dados.agencia,
      conta: dados.conta,
      pix: dados.pix,

      taxaAdministracao:
        dados.taxaAdministracao === ""
          ? 0
          : Number(dados.taxaAdministracao),

      multa:
        dados.multa === ""
          ? 0
          : Number(dados.multa),

      juros:
        dados.juros === ""
          ? 0
          : Number(dados.juros),

      observacoes: dados.observacoes,
    },
  });
};

const atualizar = async (id, dados) => {

  await campoObrigatorioService.validar('locador', dados);

  return prisma.locador.update({
    where: {
      id,
    },
    data: {
      tipoPessoa: dados.tipoPessoa,
      nome: dados.nome,
      cpfCnpj: dados.documento,
      email: dados.email,
      telefone: dados.telefone,
      banco: dados.banco,
      agencia: dados.agencia,
      conta: dados.conta,
      pix: dados.pix,

      taxaAdministracao:
        dados.taxaAdministracao === ""
          ? 0
          : Number(dados.taxaAdministracao),

      multa:
        dados.multa === ""
          ? 0
          : Number(dados.multa),

      juros:
        dados.juros === ""
          ? 0
          : Number(dados.juros),

      observacoes: dados.observacoes,
    },
  });
};

const remover = (id) => {
  return prisma.locador.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover,
};