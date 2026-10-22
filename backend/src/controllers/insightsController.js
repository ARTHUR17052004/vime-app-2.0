const insightsService = require("../services/insightsService");

const financeiro = async (req, res) => {
  try {

    const dados = await insightsService.resumoFinanceiro(req.usuario, {
      inicio: req.query.inicio,
      fim: req.query.fim,
    });

    return res.status(200).json({
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

module.exports = { financeiro };
