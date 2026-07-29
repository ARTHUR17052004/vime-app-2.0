const clicksignService = require("../services/clicksignService");
const ClicksignApi = require("../services/ClicksignApi");

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

// ==========================
// DOCUMENTOS (VIME)
// ==========================

const listarDocumentos = async (req, res) => {

  const dados = await clicksignService.listarDocumentos();

  return res.json({
    success: true,
    data: dados
  });

};

const buscarDocumento = async (req, res) => {

  const documento = await clicksignService.buscarDocumento(req.params.id);

  if (!documento) {
    return res.status(404).json({
      success: false,
      message: "Documento não encontrado."
    });
  }

  return res.json({
    success: true,
    data: documento
  });

};

const criarDocumento = async (req, res) => {

  const dados = await clicksignService.criarDocumento(req.body);

  return res.status(201).json({
    success: true,
    data: dados
  });

};

const enviarDocumento = async (req, res) => {

  const dados = await clicksignService.enviarDocumento(req.body);

  return res.json({
    success: true,
    data: dados
  });

};

const sincronizar = async (req, res) => {

  return res.json({
    success: true,
    data: await clicksignService.sincronizar()
  });

};

// ==========================
// API CLICKSIGN
// ==========================

const listarDocumentosApi = async (req, res) => {

  const dados = await ClicksignApi.listarDocumentos();

  return res.json({
    success: true,
    data: dados
  });

};

const criarDocumentoApi = async (req, res) => {

  const dados = await ClicksignApi.criarDocumento(req.body);

  return res.json({
    success: true,
    data: dados
  });

};

const buscarDocumentoApi = async (req, res) => {

  const dados = await ClicksignApi.buscarDocumento(req.params.id);

  return res.json({
    success: true,
    data: dados
  });

};

const cancelarDocumento = async (req, res) => {

  const dados = await ClicksignApi.cancelarDocumento(req.params.id);

  return res.json({
    success: true,
    data: dados
  });

};

const enviarAssinatura = async (req, res) => {

  const dados = await ClicksignApi.enviarAssinatura(
    req.params.id,
    req.body
  );

  return res.json({
    success: true,
    data: dados
  });

};

const webhook = async (req, res) => {

  const dados = await ClicksignApi.receberWebhook(req.body);

  return res.json(dados);

};

module.exports = {
  config,
  status,

  listarDocumentos,
  buscarDocumento,
  criarDocumento,
  enviarDocumento,
  sincronizar,

  listarDocumentosApi,
  criarDocumentoApi,
  buscarDocumentoApi,
  cancelarDocumento,
  enviarAssinatura,
  webhook
};