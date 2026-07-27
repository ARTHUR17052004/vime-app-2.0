const clicksignService = require('../services/clicksignService');

const config = async (req, res) => {
  return res.json({
    success: true,
    data: await clicksignService.config()
  });
};

const status = async (req, res) => {
  return res.json({
    success: true,
    data: await clicksignService.status()
  });
};

const listarDocumentos = async (req, res) => {
  return res.json({
    success: true,
    data: await clicksignService.listarDocumentos()
  });
};

const buscarDocumento = async (req, res) => {

  const documento = await clicksignService.buscarDocumento(req.params.id);

  if (!documento) {
    return res.status(404).json({
      success: false,
      message: 'Documento não encontrado.'
    });
  }

  return res.json({
    success: true,
    data: documento
  });

};

const criarDocumento = async (req, res) => {
  return res.status(201).json({
    success: true,
    data: await clicksignService.criarDocumento(req.body)
  });
};

const enviarDocumento = async (req, res) => {
  return res.json({
    success: true,
    data: await clicksignService.enviarDocumento(req.body)
  });
};

const sincronizar = async (req, res) => {
  return res.json({
    success: true,
    data: await clicksignService.sincronizar()
  });
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