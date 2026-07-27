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