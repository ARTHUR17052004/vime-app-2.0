const prisma = require("../config/prisma");
const campoObrigatorioService = require("./campoObrigatorioService");

// Aceita "10,5" (vírgula, formato brasileiro) e "10.5" (ponto). Number("10,5")
// dá NaN, e o Prisma grava NaN em coluna Float como NULL sem avisar --
// foi assim que taxaAdministracao/multa/juros sumiam silenciosamente.
const paraNumero = (v) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

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

      taxaAdministracao: paraNumero(dados.taxaAdministracao),
      multa: paraNumero(dados.multa),
      juros: paraNumero(dados.juros),

      observacoes: dados.observacoes,

      asaasToken: dados.asaasToken || null,
      asaasWalletId: dados.asaasWalletId || null,
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

      taxaAdministracao: paraNumero(dados.taxaAdministracao),
      multa: paraNumero(dados.multa),
      juros: paraNumero(dados.juros),

      observacoes: dados.observacoes,

      asaasToken: dados.asaasToken || null,
      asaasWalletId: dados.asaasWalletId || null,
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