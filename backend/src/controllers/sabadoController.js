const sabadoService = require("../services/sabadoService");
const sabadoConversaService = require("../services/sabadoConversaService");

const chat = async (req, res) => {
  try {

    const dados = await sabadoService.responderChat(req.usuario, {
      conversaId: req.body.conversaId,
      mensagem: req.body.mensagem,
    });

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

const listarConversas = async (req, res) => {
  try {

    const dados = await sabadoConversaService.listarConversas(req.usuario, { busca: req.query.busca });

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

const buscarConversa = async (req, res) => {
  try {

    const dados = await sabadoConversaService.buscarConversa(req.usuario, req.params.id);

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(404).json({ success: false, message: error.message });

  }
};

const excluirConversa = async (req, res) => {
  try {

    await sabadoConversaService.excluirConversa(req.usuario, req.params.id);

    return res.status(200).json({ success: true });

  } catch (error) {

    return res.status(404).json({ success: false, message: error.message });

  }
};

module.exports = { chat, listarConversas, buscarConversa, excluirConversa };
