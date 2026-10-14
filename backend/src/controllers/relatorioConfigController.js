const relatorioConfigService = require("../services/relatorioConfigService");

const listarConfig = async (req, res) => {

  const dados = await relatorioConfigService.listar();

  return res.json({ success: true, data: dados });

};

const atualizarConfig = async (req, res) => {

  const dados = await relatorioConfigService.atualizar(req.params.tipo, req.body || {});

  return res.json({ success: true, data: dados });

};

module.exports = { listarConfig, atualizarConfig };
