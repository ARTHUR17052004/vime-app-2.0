const asaasService = require('../services/asaasService');
const gatewayPagamentoService = require('../services/gatewayPagamentoService');

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
  const resultado = await asaasService.testarConexao();

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado
  });
};

const testarConexaoLocador = async (req, res) => {
  const resultado = await asaasService.testarConexaoLocador(req.params.id);

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado
  });
};

const registrarWebhookLocador = async (req, res) => {

  const webhookUrl = process.env.ASAAS_WEBHOOK_URL || `${req.protocol}://${req.get("host")}/asaas/webhook`;

  const resultado = await asaasService.registrarWebhookLocador(req.params.id, webhookUrl);

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado
  });
};

const buscarWallet = async (req, res) => {
  const resultado = await asaasService.buscarWallet();

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado
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

const enviarCobranca = async (req, res) => {

  // Escolhe Asaas ou BB sozinho, olhando a conta configurada no
  // locador do contrato/inquilino dessa receita -- ver
  // gatewayPagamentoService.js.
  const resultado = await gatewayPagamentoService.enviarCobranca(req.params.id);

  return res.status(resultado.success ? 200 : 400).json({
    success: resultado.success,
    message: resultado.mensagem,
    data: resultado,
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
const crypto = require("crypto");
const prisma = require("../config/prisma");

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

const gerarTokenWebhook = async (req, res) => {

  const novoToken = crypto.randomBytes(24).toString("hex");

  const configuracao = await prisma.configuracao.findFirst({
    orderBy: { id: "asc" },
  });

  if (!configuracao) {
    return res.status(400).json({
      success: false,
      message: "Cadastre os dados da empresa em Configurações antes de gerar o token do webhook.",
    });
  }

  await prisma.configuracao.update({
    where: { id: configuracao.id },
    data: { asaasWebhookToken: novoToken },
  });

  return res.json({
    success: true,
    data: { webhookToken: novoToken },
  });

};

const testarWebhook = async (req, res) => {

  const { apiKey, webhookToken } = await AsaasApi.obterConfig();

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: "Configure a API Key do Asaas antes de testar o webhook.",
      data: { mensagem: "Configure a API Key do Asaas antes de testar o webhook." },
    });
  }

  const webhookUrl = process.env.ASAAS_WEBHOOK_URL || `${req.protocol}://${req.get("host")}/asaas/webhook`;

  try {

    await AsaasApi.configurarWebhook(
      webhookUrl,
      webhookToken || undefined,
      ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_OVERDUE", "PAYMENT_REFUNDED", "PAYMENT_DELETED", "PAYMENT_RESTORED"]
    );

    return res.json({
      success: true,
      data: { mensagem: "Webhook registrado com sucesso no Asaas.", url: webhookUrl },
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message || "Não foi possível registrar o webhook no Asaas.",
      data: { mensagem: error.message || "Não foi possível registrar o webhook no Asaas." },
    });

  }

};

const webhook = async (req, res) => {

  const { webhookToken } = await AsaasApi.obterConfig();

  if (webhookToken) {

    const tokenRecebido = req.headers["asaas-access-token"];

    if (tokenRecebido !== webhookToken) {
      return res.status(401).json({
        success: false,
        message: "Token de webhook inválido.",
      });
    }

  }

  const dados = await asaasService.sincronizar(req.body);

  return res.json(dados);

};

module.exports = {
  config,
  status,
  testarConexao,
  testarConexaoLocador,
  registrarWebhookLocador,
  buscarWallet,
  listarTransacoes,
  buscarTransacao,
  enviarCobranca,
  resumo,
  sincronizar,
  listarClientes,
  criarCliente,
  listarCobrancas,
  criarCobranca,
  gerarTokenWebhook,
  testarWebhook,
  webhook
};