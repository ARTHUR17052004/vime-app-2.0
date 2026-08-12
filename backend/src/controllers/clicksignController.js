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

const testarConexao = async (req, res) => {

  const resultado = await clicksignService.testarConexao();

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado
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

  const dados = await clicksignService.sincronizar();

  return res.json({
    success: true,
    data: dados
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

  const dados = await clicksignService.processarWebhook(req.body);

  return res.json(dados);

};

module.exports = {
  config,
  status,
  testarConexao,

  enviarDocumento,
  sincronizar,

  listarDocumentosApi,
  criarDocumentoApi,
  buscarDocumentoApi,
  cancelarDocumento,
  enviarAssinatura,
  webhook
};