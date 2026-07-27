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

const sincronizar = async () => {
  return {
    success: true,
    message: 'Sincronização simulada concluída.'
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