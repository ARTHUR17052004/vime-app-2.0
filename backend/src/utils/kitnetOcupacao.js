const prisma = require("../config/prisma");

// Uma kitnet pode ter mais de um inquilino/contrato ao mesmo tempo
// (república, por exemplo). Antes de marcar ela como vazia por causa da
// saída de UM inquilino/contrato, confere se não sobrou outro ativo --
// senão o sistema mostrava "vazia" com gente ainda morando lá, só
// porque um dos vários saiu.
const kitnetAindaOcupada = async (kitnetId, { ignorarInquilinoId, ignorarContratoId } = {}) => {

  const outroInquilino = await prisma.inquilino.findFirst({
    where: {
      kitnetId,
      ativo: true,
      ...(ignorarInquilinoId ? { id: { not: ignorarInquilinoId } } : {}),
    },
  });

  if (outroInquilino) return true;

  const outroContrato = await prisma.contrato.findFirst({
    where: {
      kitnetId,
      status: { in: ["ATIVO", "PENDENTE"] },
      ...(ignorarContratoId ? { id: { not: ignorarContratoId } } : {}),
    },
  });

  return Boolean(outroContrato);

};

// Mesma ideia pro inquilino: só desativa se ele não tiver outro
// contrato em andamento (ex.: renovação que já gerou um contrato novo
// antes do antigo ser encerrado/excluído).
const inquilinoTemOutroContratoAtivo = async (inquilinoId, { ignorarContratoId } = {}) => {

  const outroContrato = await prisma.contrato.findFirst({
    where: {
      inquilinoId,
      status: { in: ["ATIVO", "PENDENTE"] },
      ...(ignorarContratoId ? { id: { not: ignorarContratoId } } : {}),
    },
  });

  return Boolean(outroContrato);

};

module.exports = { kitnetAindaOcupada, inquilinoTemOutroContratoAtivo };
