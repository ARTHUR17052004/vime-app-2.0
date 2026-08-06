const whatsappService = require("../services/whatsappService");

/* ==========================================
   VALIDAR WEBHOOK META
========================================== */

const validarWebhook = async (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {

    console.log("Webhook Meta validado.");

    return res.status(200).send(challenge);

  }

  return res.sendStatus(403);

};

/* ==========================================
   STATUS
========================================== */

const status = async (req, res) => {

  try {

    const dados = await whatsappService.status();

    return res.json({
      success: true,
      data: dados
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

/* ==========================================
   CONVERSAS
========================================== */

const conversas = async (req, res) => {

  try {

    const dados = await whatsappService.conversas();

    return res.json({
      success: true,
      data: dados
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

/* ==========================================
   SINCRONIZAR
========================================== */

const sincronizar = async (req, res) => {

  try {

    const dados = await whatsappService.sincronizar();

    return res.json({
      success: true,
      data: dados,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

/* ==========================================
   CONFIGURAÇÃO
========================================== */

const configuracao = async (req, res) => {

  try {

    const dados = await whatsappService.configuracao();

    return res.json({
      success: true,
      data: dados
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const salvarConfiguracao = async (req, res) => {

  try {

    const dados = await whatsappService.salvarConfiguracao(req.body);

    return res.json({
      success: true,
      data: dados
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

/* ==========================================
   CONECTAR
========================================== */

const conectar = async (req, res) => {

  try {

    const dados = await whatsappService.conectar();

    return res.json({
      success: true,
      data: dados,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

/* ==========================================
   GERAR QR CODE
========================================== */

const gerarQrCode = async (req, res) => {

  try {

    const dados = await whatsappService.gerarQrCode();

    return res.json({
      success: true,
      data: dados,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

/* ==========================================
   ENVIAR
========================================== */

const enviar = async (req, res) => {

  try {

    const dados = await whatsappService.enviarMensagem(req.body);

    return res.json({
      success: true,
      data: dados
    });

  } catch (error) {

  console.error("===== ERRO WHATSAPP =====");
  console.error(error);
  console.error(error.response?.data);
  console.error("=========================");

  return res.status(500).json({
    success: false,
    message: error.message,
  });

}

};

/* ==========================================
   RECEBER
========================================== */

const receber = async (req, res) => {

  try {

    const dados = await whatsappService.receberMensagem(req.body);

    return res.json({
      success: true,
      data: dados
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

/* ==========================================
   WEBHOOK
========================================== */

const webhook = async (req, res) => {

  try {

    const dados = await whatsappService.webhook(req.body);

    return res.json(dados);

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {

  validarWebhook,

  conectar,

  gerarQrCode,

  status,

  conversas,

  sincronizar,

  configuracao,

  salvarConfiguracao,

  enviar,

  receber,

  webhook,

};