const prisma = require("../config/prisma");
const ClicksignApi = require("./ClicksignApi");

const config = async () => {
  return {
    ambiente: process.env.CLICKSIGN_ENV || 'sandbox',
    configurado: !!process.env.CLICKSIGN_API_KEY,
    apiUrl: process.env.CLICKSIGN_API_URL || null
  };
};

const status = async () => {
  return {
    online: true,
    ambiente: process.env.CLICKSIGN_ENV || 'sandbox',
    configurado: !!process.env.CLICKSIGN_API_KEY
  };
};

const enviarDocumento = async (dados) => {
  return {
    enviado: true,
    status: 'AGUARDANDO_ASSINATURA',
    documento: dados
  };
};

/* ==========================================
   PROCESSAR WEBHOOK (chamado pela ClickSign)
========================================== */

const processarWebhook = async (evento) => {

  if (!evento) {
    return {
      success: false,
      message: "Evento inválido."
    };
  }

  const documento = await prisma.contrato.findFirst({
    where: {
      id: evento.document?.key
    }
  });

  if (!documento) {
    return {
      success: false,
      message: "Contrato não encontrado."
    };
  }

  switch (evento.event?.name) {

    case "signature_finished":

      await prisma.contrato.update({
        where: {
          id: documento.id
        },
        data: {
          status: "ASSINADO"
        }
      });

      break;

    case "document_cancelled":

      await prisma.contrato.update({
        where: {
          id: documento.id
        },
        data: {
          status: "CANCELADO"
        }
      });

      break;

  }

  return {
    success: true
  };

};

/* ==========================================
   SINCRONIZAÇÃO MANUAL (botão na tela)
   Busca documentos reais na ClickSign e
   atualiza os contratos locais.

   ATENÇÃO: ajuste os nomes dos campos
   (doc.status, doc.key) conforme o formato
   real que a API da ClickSign devolver —
   sugiro dar um console.log(documentos)
   na primeira execução pra conferir.
========================================== */

const sincronizar = async () => {

  const resposta = await ClicksignApi.listarDocumentos();

  const documentos = resposta?.documents || resposta?.data || [];

  let atualizados = 0;

  for (const doc of documentos) {

    const contrato = await prisma.contrato.findFirst({
      where: {
        id: doc.key || doc.id
      }
    });

    if (!contrato) continue;

    let novoStatus = contrato.status;

    if (doc.status === "closed" || doc.finished === true) {
      novoStatus = "ASSINADO";
    } else if (doc.status === "canceled") {
      novoStatus = "CANCELADO";
    }

    if (novoStatus !== contrato.status) {

      await prisma.contrato.update({
        where: { id: contrato.id },
        data: { status: novoStatus }
      });

      atualizados++;
    }

  }

  return {
    success: true,
    atualizados
  };

};

module.exports = {
  config,
  status,
  enviarDocumento,
  sincronizar,
  processarWebhook
};