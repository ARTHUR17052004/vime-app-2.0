const prisma = require("../config/prisma");
const campoObrigatorioService = require("./campoObrigatorioService");
const { validarTelefone, validarDocumento } = require("../utils/validadores");

const validar = (dados) => {

  if (dados.telefone && !validarTelefone(dados.telefone)) {
    throw new Error("Telefone inválido.");
  }

  if (dados.documento && !validarDocumento(dados.documento)) {
    throw new Error(
      dados.tipoPessoa === "PJ" ? "CNPJ inválido." : "CPF/CNPJ inválido."
    );
  }

};

// Aceita "10,5" (vírgula, formato brasileiro) e "10.5" (ponto). Number("10,5")
// dá NaN, e o Prisma grava NaN em coluna Float como NULL sem avisar --
// foi assim que taxaAdministracao/multa/juros sumiam silenciosamente.
const paraNumero = (v) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

// Diferente de paraNumero: aqui "vazio" precisa continuar vazio (null),
// não virar 0 -- é o que sinaliza "vencimento rotativo, no dia do
// cadastro" pras Residências desse locador.
const paraInteiroOuNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

const listar = (usuario) => {
  return prisma.locador.findMany({
    where: usuario?.locadorId ? { id: usuario.locadorId } : {},
    include: {
      unidades: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const criar = async (dados) => {

  validar(dados);
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

      diaVencimentoPadrao: paraInteiroOuNull(dados.diaVencimentoPadrao),

      observacoes: dados.observacoes,

      asaasToken: dados.asaasToken || null,
      asaasWalletId: dados.asaasWalletId || null,
    },
  });
};

const atualizar = async (id, dados) => {

  validar(dados);
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

      diaVencimentoPadrao: paraInteiroOuNull(dados.diaVencimentoPadrao),

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