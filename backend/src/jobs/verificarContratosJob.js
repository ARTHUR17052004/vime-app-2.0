const prisma = require("../config/prisma");
const logService = require("../services/logService");
const { emitirAtualizacao } = require("../socket");
const { kitnetAindaOcupada, inquilinoTemOutroContratoAtivo, gerarVistoriaDeEntrega } = require("../utils/kitnetOcupacao");

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

    // Sem ignorarInquilinoId, kitnetAindaOcupada encontrava o PRÓPRIO
    // inquilino desse contrato (ainda com ativo:true nesse instante) e
    // achava que "sobrou" morador -- a kitnet nunca era liberada
    // sozinha pelo job, mesmo sem ninguém mais morando lá.
    if (!(await kitnetAindaOcupada(contrato.kitnetId, { ignorarContratoId: contrato.id, ignorarInquilinoId: contrato.inquilinoId }))) {
      await prisma.kitnet.update({
        where: {
          id: contrato.kitnetId
        },
        data: {
          ocupada: false,
          status: "DISPONIVEL"
        }
      });
      gerarVistoriaDeEntrega(contrato.kitnetId);
    }

    // Mesma lógica de inquilinoService/contratoService.encerrar -- o
    // job não desativava o inquilino, então ele continuava "ativo"
    // para sempre mesmo depois do contrato vencer sozinho.
    if (!(await inquilinoTemOutroContratoAtivo(contrato.inquilinoId, { ignorarContratoId: contrato.id }))) {
      await prisma.inquilino.update({
        where: { id: contrato.inquilinoId },
        data: { ativo: false }
      });
    }

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

  if (contratos.length > 0) {
    emitirAtualizacao("contrato");
  }

};