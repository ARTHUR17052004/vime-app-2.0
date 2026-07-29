const asaasService = require('../services/asaasService');

const config = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.config()
  });
};

const status = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.status()
  });
};

const testarConexao = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.testarConexao()
  });
};

const buscarWallet = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.buscarWallet()
  });
};

const listarTransacoes = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.listarTransacoes()
  });
};

const buscarTransacao = async (req, res) => {

  const dados = await asaasService.buscarTransacao(req.params.id);

  if (!dados) {
    return res.status(404).json({
      success: false,
      message: 'Transação não encontrada.'
    });
  }

  return res.json({
    success: true,
    data: dados
  });

};

const resumo = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.resumo()
  });
};

const sincronizar = async (req, res) => {
  return res.json({
    success: true,
    data: await asaasService.sincronizar()
  });
};

const AsaasApi = require("../services/AsaasApi");

const listarClientes = async (req, res) => {

  const dados = await AsaasApi.listarClientes();

  return res.json({
    success: true,
    data: dados
  });

};

const criarCliente = async (req, res) => {

  const dados = await AsaasApi.criarCliente(req.body);

  return res.json({
    success: true,
    data: dados
  });

};

const listarCobrancas = async (req, res) => {

  const dados = await AsaasApi.listarCobrancas();

  return res.json({
    success: true,
    data: dados
  });

};

const criarCobranca = async (req, res) => {

  const dados = await AsaasApi.criarCobranca(req.body);

  return res.json({
    success: true,
    data: dados
  });

};

const webhook = async (req, res) => {

  const dados = await AsaasApi.receberWebhook(req.body);

  return res.json(dados);

};

module.exports = {
  config,
  status,
  testarConexao,
  buscarWallet,
  listarTransacoes,
  buscarTransacao,
  resumo,
  sincronizar,
  listarClientes,
  criarCliente,
  listarCobrancas,
  criarCobranca,
  webhook
};