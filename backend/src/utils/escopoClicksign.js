const prisma = require("../config/prisma");
const { filtroContrato } = require("./escopoLocador");

// A conta da Clicksign é uma só pra empresa toda. Pra usuário restrito a
// um locador, só valem os documentos de contratos dele (a ligação é
// contrato.clicksignDocumentKey).
const chavesDoEscopo = async (usuario) => {

  const contratos = await prisma.contrato.findMany({
    where: { ...filtroContrato(usuario), clicksignDocumentKey: { not: null } },
    select: { clicksignDocumentKey: true },
  });

  return new Set(contratos.map((c) => c.clicksignDocumentKey));

};

const chaveDe = (d) => d?.key ?? d?.document?.key ?? d?.id ?? d?.document?.id;

// A API devolve a lista em formatos diferentes; se não reconhecer o
// formato, devolve vazio -- nunca "tudo".
const filtrarDocumentos = (dados, chaves) => {

  const filtra = (lista) => lista.filter((d) => chaves.has(chaveDe(d)));

  if (Array.isArray(dados)) return filtra(dados);

  for (const campo of ["documents", "data", "items"]) {
    if (Array.isArray(dados?.[campo])) return { ...dados, [campo]: filtra(dados[campo]) };
  }

  return { documents: [] };

};

module.exports = { chavesDoEscopo, filtrarDocumentos };
