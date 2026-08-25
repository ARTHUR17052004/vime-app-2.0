const prisma = require("../config/prisma");
const contratoService = require("../services/contratoService");

const DIAS_ALERTA_VENCIMENTO = 10;

// Varre contratos em andamento com vencimento próximo (até 10 dias) e
// notifica quem ainda não foi notificado -- a checagem de duplicidade
// já mora em contratoService.notificarSeVencimentoProximo, então esse
// job só precisa buscar os candidatos e chamar a mesma função usada
// na hora da criação do contrato.
module.exports = async () => {

  console.log("[JOB] Verificando contratos com vencimento próximo...");

  const hoje = new Date();

  const emDiasAlerta = new Date();
  emDiasAlerta.setDate(emDiasAlerta.getDate() + DIAS_ALERTA_VENCIMENTO);

  const contratos = await prisma.contrato.findMany({
    where: {
      status: { in: ["ATIVO", "PENDENTE"] },
      dataFim: {
        not: null,
        gte: hoje,
        lte: emDiasAlerta
      }
    },
    include: {
      inquilino: true
    }
  });

  for (const contrato of contratos) {

    try {
      await contratoService.notificarSeVencimentoProximo(contrato);
    } catch (erro) {
      console.error(`[JOB] Erro ao notificar vencimento do contrato ${contrato.id}:`, erro.message);
    }

  }

  console.log(`[JOB] ${contratos.length} contrato(s) verificado(s) para aviso de vencimento.`);

};
