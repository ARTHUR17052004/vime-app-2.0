const prisma = require("../config/prisma");

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

const listarDocumentos = async () => {
  return [];
};

const buscarDocumento = async (id) => {
  return null;
};

const criarDocumento = async (dados) => {
  return {
    id: 'SIMULADO',
    status: 'CRIADO',
    documento: dados
  };
};

const enviarDocumento = async (dados) => {
  return {
    enviado: true,
    status: 'AGUARDANDO_ASSINATURA',
    documento: dados
  };
};

const sincronizar = async (evento) => {

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

module.exports = {
  config,
  status,
  listarDocumentos,
  buscarDocumento,
  criarDocumento,
  enviarDocumento,
  sincronizar
};