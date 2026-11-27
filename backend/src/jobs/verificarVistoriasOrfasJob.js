const prisma = require("../config/prisma");
const { gerarVistoriaDeEntrega, cancelarVistoriaDeEntrega } = require("../utils/kitnetOcupacao");

/*
  Rede de segurança pra "Vistoria de entrega" ficar sempre coerente com
  o status de verdade da kitnet -- o gatilho síncrono (extensão do
  Prisma Client em config/prisma.js, só no prisma.kitnet.update) cobre o
  caminho normal, mas qualquer mudança de status que não passe por ali
  (edição direta no banco, script de correção, etc.) deixa a vistoria
  órfã presa aberta pra sempre -- bug relatado de novo em 27/11/2026
  (3 kitnets já ocupadas de novo ainda com "Vistoria de entrega" aberta,
  e uma kitnet vazia há 21 dias sem vistoria nenhuma). Roda de hora em
  hora (ver jobs/index.js), reconciliando os dois lados:
  1) Vistoria de entrega aberta cuja kitnet não está mais DISPONIVEL ->
     cancela (mesma função usada pelo gatilho síncrono).
  2) Kitnet DISPONIVEL sem nenhuma vistoria de entrega aberta -> gera
     uma (gerarVistoriaDeEntrega já é seguro de chamar de novo, tem seu
     próprio "já existe?" por dentro).
*/
module.exports = async () => {

  console.log("[JOB] Verificando vistorias de entrega órfãs...");

  const abertasComKitnetOcupada = await prisma.vistoria.findMany({
    where: {
      categoria: "Entrega de kitnet vazia",
      status: { notIn: ["REALIZADA", "CANCELADA"] },
      kitnet: { status: { not: "DISPONIVEL" } },
    },
    select: { kitnetId: true },
  });

  const kitnetIdsParaCancelar = [...new Set(abertasComKitnetOcupada.map((v) => v.kitnetId))];

  for (const kitnetId of kitnetIdsParaCancelar) {
    await cancelarVistoriaDeEntrega(kitnetId);
  }

  const vaziasSemVistoria = await prisma.kitnet.findMany({
    where: {
      status: "DISPONIVEL",
      vistorias: {
        none: {
          categoria: "Entrega de kitnet vazia",
          status: { notIn: ["REALIZADA", "CANCELADA"] },
        },
      },
    },
    select: { id: true },
  });

  for (const kitnet of vaziasSemVistoria) {
    await gerarVistoriaDeEntrega(kitnet.id);
  }

  console.log(
    `[JOB] Vistorias órfãs: ${kitnetIdsParaCancelar.length} canceladas (kitnet já ocupada de novo), ${vaziasSemVistoria.length} geradas (kitnet vazia sem vistoria nenhuma).`
  );

  return { canceladas: kitnetIdsParaCancelar.length, geradas: vaziasSemVistoria.length };

};
