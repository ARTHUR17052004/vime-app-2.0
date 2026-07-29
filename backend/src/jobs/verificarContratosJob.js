const prisma = require("../config/prisma");
const logService = require("../services/logService");

module.exports = async () => {

  console.log("[JOB] Verificando contratos...");

  const hoje = new Date();

  const contratos = await prisma.contrato.findMany({
    where: {
      status: "ATIVO",
      dataFim: {
        not: null,
        lte: hoje
      }
    }
  });

  for (const contrato of contratos) {

    await prisma.contrato.update({
      where: {
        id: contrato.id
      },
      data: {
        status: "ENCERRADO"
      }
    });

    await prisma.kitnet.update({
      where: {
        id: contrato.kitnetId
      },
      data: {
        ocupada: false,
        status: "DISPONIVEL"
      }
    });

    await logService.registrar({
      usuarioId: null,
      usuarioNome: "Scheduler",
      modulo: "CONTRATOS",
      acao: "ENCERRAMENTO_AUTOMATICO",
      descricao: `Contrato ${contrato.id} encerrado automaticamente.`
    });

    console.log(
      `[JOB] Contrato ${contrato.id} encerrado automaticamente.`
    );

  }

};