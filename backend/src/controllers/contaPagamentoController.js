const contaPagamentoService = require('../services/contaPagamentoService');
const asaasService = require('../services/asaasService');

const listar = async (req, res) => {

  try {

    const contas = await contaPagamentoService.listar();

    return res.json({ success: true, data: contas });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }

};

const criar = async (req, res) => {

  try {

    const conta = await contaPagamentoService.criar(req.body);

    return res.status(201).json({ success: true, data: conta });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

const atualizar = async (req, res) => {

  try {

    const conta = await contaPagamentoService.atualizar(req.params.id, req.body);

    return res.json({ success: true, data: conta });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

const remover = async (req, res) => {

  try {

    await contaPagamentoService.remover(req.params.id);

    return res.json({ success: true, message: 'Conta removida com sucesso.' });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

const extratoPix = async (req, res) => {

  try {

    const extrato = await contaPagamentoService.extratoPixDoMes(req.params.id, req.query.mes);

    return res.json({ success: true, data: extrato });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

// Só se aplica a contas do provider ASAAS (ver asaasService) -- BB/EFI/BRB
// não têm esse conceito de "conectar numa conta deles" nem webhook ainda.
const testarConexao = async (req, res) => {

  const resultado = await asaasService.testarConexaoConta(req.params.id);

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado,
  });

};

const registrarWebhook = async (req, res) => {

  const webhookUrl = process.env.ASAAS_WEBHOOK_URL || `${req.protocol}://${req.get('host')}/asaas/webhook`;

  const resultado = await asaasService.registrarWebhookConta(req.params.id, webhookUrl);

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado,
  });

};

module.exports = {
  listar,
  criar,
  atualizar,
  remover,
  extratoPix,
  testarConexao,
  registrarWebhook,
};
