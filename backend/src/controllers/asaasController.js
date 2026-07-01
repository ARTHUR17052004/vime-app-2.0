const asaasService = require('../services/asaasService');

const config = async (req, res) => {
  const dados = await asaasService.config();
  res.json(dados);
};

const status = async (req, res) => {
  const dados = await asaasService.status();
  res.json(dados);
};

const testarConexao = async (req, res) => {
  const dados = await asaasService.testarConexao();
  res.json(dados);
};

const buscarWallet = async (req, res) => {
  const dados = await asaasService.buscarWallet();
  res.json(dados);
};

const listarTransacoes = async (req, res) => {
  const dados = await asaasService.listarTransacoes();
  res.json(dados);
};

const buscarTransacao = async (req, res) => {
  const dados = await asaasService.buscarTransacao(req.params.id);

  if (!dados) {
    return res.status(404).json({
      mensagem: 'Transação não encontrada'
    });
  }

  res.json(dados);
};

const resumo = async (req, res) => {
  const dados = await asaasService.resumo();
  res.json(dados);
};

const sincronizar = async (req, res) => {
  const dados = await asaasService.sincronizar();
  res.json(dados);
};

module.exports = {
  config,
  status,
  testarConexao,
  buscarWallet,
  listarTransacoes,
  buscarTransacao,
  resumo,
  sincronizar
};