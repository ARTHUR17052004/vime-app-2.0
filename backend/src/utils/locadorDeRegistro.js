const prisma = require("../config/prisma");

// Descobre de qual locador é um registro -- usado pra marcar cada
// notificação com o locador dela e assim usuário restrito (ex.: SH) não
// receber aviso de outro locador (ex.: ARA). Sem locador conhecido
// devolve null: aí só quem vê o sistema inteiro recebe.

const daUnidade = async (id) =>
  (await prisma.unidade.findUnique({ where: { id }, select: { locadorId: true } }))?.locadorId || null;

const daKitnet = async (id) =>
  (await prisma.kitnet.findUnique({ where: { id }, select: { unidade: { select: { locadorId: true } } } }))?.unidade?.locadorId || null;

const doContrato = async (id) =>
  (await prisma.contrato.findUnique({ where: { id }, select: { locadorId: true } }))?.locadorId || null;

const doInquilino = async (id) =>
  (await prisma.inquilino.findUnique({ where: { id }, select: { kitnet: { select: { unidade: { select: { locadorId: true } } } } } }))?.kitnet?.unidade?.locadorId || null;

const daVistoria = async (id) => {

  const v = await prisma.vistoria.findUnique({
    where: { id },
    select: { unidade: { select: { locadorId: true } }, kitnet: { select: { unidade: { select: { locadorId: true } } } } },
  });

  return v?.unidade?.locadorId || v?.kitnet?.unidade?.locadorId || null;

};

const daReceita = async (id) => {

  const r = await prisma.receita.findUnique({
    where: { id },
    select: {
      contrato: { select: { locadorId: true } },
      inquilino: { select: { kitnet: { select: { unidade: { select: { locadorId: true } } } } } },
    },
  });

  return r?.contrato?.locadorId || r?.inquilino?.kitnet?.unidade?.locadorId || null;

};

const daSolicitacao = async (id) =>
  (await prisma.solicitacao.findUnique({ where: { id }, select: { locadorId: true } }))?.locadorId || null;

const PELO_LINK = {
  solicitacoes: daSolicitacao,
  kitnets: daKitnet,
  contratos: doContrato,
  unidades: daUnidade,
  inquilinos: doInquilino,
  vistorias: daVistoria,
};

// "/kitnets/<id>" -> locador da unidade dessa kitnet. Links sem id de um
// desses módulos (ex.: "/financeiro", "/whatsapp") devolvem null.
const doLink = async (link) => {

  const m = /^\/(kitnets|contratos|unidades|inquilinos|vistorias|solicitacoes)\/([^/?#]+)/.exec(link || "");

  if (!m) return null;

  try {
    return await PELO_LINK[m[1]](m[2]);
  } catch (e) {
    return null;
  }

};

module.exports = { doLink, daReceita, doInquilino, doContrato, daKitnet, daUnidade, daVistoria };
