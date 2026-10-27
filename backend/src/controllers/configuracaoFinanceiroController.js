const configuracaoFinanceiroService = require("../services/configuracaoFinanceiroService");

const buscar = async (req, res) => {
  try {

    const dados = await configuracaoFinanceiroService.buscar();

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

const atualizar = async (req, res) => {
  try {

    const dados = await configuracaoFinanceiroService.atualizar(req.body);

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }
};

module.exports = { buscar, atualizar };
