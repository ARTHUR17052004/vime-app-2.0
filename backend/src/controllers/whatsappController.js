const whatsappService = require("../services/whatsappService");

const status = async (req, res) => {

  const dados = await whatsappService.status();

  res.json({
    success: true,
    data: dados
  });

};

const enviar = async (req, res) => {

  const dados = await whatsappService.enviarMensagem(req.body);

  res.json({
    success: true,
    data: dados
  });

};

const receber = async (req, res) => {

  const dados = await whatsappService.receberMensagem(req.body);

  res.json({
    success: true,
    data: dados
  });

};

const webhook = async (req, res) => {

  const dados = await whatsappService.webhook(req.body);

  res.json(dados);

};

module.exports = {
  status,
  enviar,
  receber,
  webhook
};