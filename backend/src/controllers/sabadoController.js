const sabadoService = require("../services/sabadoService");

const resumoExecutivo = async (req, res) => {
  try {

    const dados = await sabadoService.gerarResumoExecutivo(req.usuario, {
      inicio: req.query.inicio,
      fim: req.query.fim,
    });

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

module.exports = { resumoExecutivo };
