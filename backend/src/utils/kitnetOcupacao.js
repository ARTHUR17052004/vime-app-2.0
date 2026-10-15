const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

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

// Toda vez que uma kitnet fica vazia de verdade (sem ninguém mais
// morando), gera sozinha uma vistoria de entrega pro Zelador validar em
// que estado ela ficou -- com o mesmo relógio de 72h que "Kitnet vazia"
// já usa (dataProxima = agora; verificarVistoriasAtrasadasJob.js cuida
// do alerta depois, igual qualquer outra vistoria).
const gerarVistoriaDeEntrega = async (kitnetId) => {

  try {

    const kitnet = await prisma.kitnet.findUnique({
      where: { id: kitnetId },
      include: { unidade: true },
    });

    if (!kitnet || kitnet.status !== "DISPONIVEL") return;

    // Evita duplicar: já existe uma vistoria de entrega em aberto pra
    // essa kitnet (ex.: dois gatilhos quase juntos, tipo editar e
    // excluir o mesmo inquilino em sequência)?
    const jaExiste = await prisma.vistoria.findFirst({
      where: {
        kitnetId,
        categoria: "Entrega de kitnet vazia",
        status: { notIn: ["REALIZADA", "CANCELADA"] },
      },
    });

    if (jaExiste) return;

    const nomeKitnet = kitnet.nome || `Kitnet ${kitnet.numero}`;
    const nomeUnidade = kitnet.unidade?.nome || "residência";
    const agora = new Date();

    const vistoria = await prisma.vistoria.create({
      data: {
        titulo: `Vistoria de entrega - ${nomeKitnet} (${nomeUnidade})`,
        descricao: "Gerada automaticamente: a kitnet acabou de ficar vazia. Confira o estado de entrega antes de disponibilizar pro próximo inquilino.",
        unidadeId: kitnet.unidadeId,
        kitnetId: kitnet.id,
        categoria: "Entrega de kitnet vazia",
        criticidade: "Alta",
        responsavel: "Zelador",
        status: "PENDENTE",
        data: agora,
        dataProxima: agora,
      },
    });

    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Nova vistoria",
      mensagem: `🔑 ${nomeKitnet} (${nomeUnidade}) acabou de ficar vazia. Dá uma olhada em como ela foi entregue assim que puder!`,
      link: `/vistorias/${vistoria.id}`,
    });

  } catch (erro) {

    // Nunca pode travar o fluxo (encerrar contrato, excluir inquilino...)
    // por causa disso -- só loga.
    console.error("[vistoria-automatica] Falha ao gerar vistoria de entrega:", erro.message);

  }

};

module.exports = { kitnetAindaOcupada, inquilinoTemOutroContratoAtivo, gerarVistoriaDeEntrega };
