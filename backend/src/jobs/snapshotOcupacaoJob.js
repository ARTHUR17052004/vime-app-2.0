const prisma = require("../config/prisma");

/*
  Guarda 1 fotografia por dia da ocupação de kitnets -- o único jeito
  honesto do SABADO responder "qual era minha ocupação entre X e Y"
  sem inventar número: Kitnet.status é só "agora", sem log de mudança,
  então sem esse snapshot não existe como saber o que era ocupado em
  qualquer dia que não seja hoje.
*/

function hojeMeiaNoite() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function snapshotarLocador(data, locadorId) {

  const escopoKitnet = locadorId ? { unidade: { locadorId } } : {};
  const escopoUnidade = locadorId ? { locadorId } : {};

  const [residenciasTotal, kitnetsTotal, kitnetsOcupadas] = await Promise.all([
    prisma.unidade.count({ where: escopoUnidade }),
    prisma.kitnet.count({ where: escopoKitnet }),
    prisma.kitnet.count({ where: { ...escopoKitnet, status: "OCUPADA" } }),
  ]);

  const taxaOcupacao = kitnetsTotal > 0 ? Math.round((kitnetsOcupadas / kitnetsTotal) * 100) : 0;

  // upsert com @@unique([data, locadorId]) não dá certo aqui -- o
  // Prisma não aceita `null` no filtro de um unique composto, mesmo
  // com o campo sendo opcional no schema. find + update/create manual
  // contorna isso.
  const existente = await prisma.snapshotOcupacao.findFirst({ where: { data, locadorId } });

  const dados = { residenciasTotal, kitnetsTotal, kitnetsOcupadas, taxaOcupacao };

  if (existente) {
    await prisma.snapshotOcupacao.update({ where: { id: existente.id }, data: dados });
  } else {
    await prisma.snapshotOcupacao.create({ data: { data, locadorId, ...dados } });
  }

}

async function snapshotOcupacaoJob() {

  try {

    const data = hojeMeiaNoite();

    const locadores = await prisma.locador.findMany({ select: { id: true } });

    await snapshotarLocador(data, null);

    for (const locador of locadores) {
      await snapshotarLocador(data, locador.id);
    }

    console.log(`[JOB] Snapshot de ocupação salvo para ${data.toISOString().slice(0, 10)} (visão geral + ${locadores.length} locador(es)).`);

  } catch (error) {

    console.error("[JOB] Erro ao salvar snapshot de ocupação:", error.message);

  }

}

module.exports = snapshotOcupacaoJob;
