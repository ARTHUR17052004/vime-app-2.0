const relatorioEnvioService = require("../services/relatorioEnvioService");

const listar = async (req, res) => {
  const dados = await relatorioEnvioService.listar();
  return res.json({ success: true, data: dados });
};

const criar = async (req, res) => {
  const dados = await relatorioEnvioService.criar(req.body || {}, req.usuario);
  return res.status(201).json({ success: true, data: dados });
};

const cancelar = async (req, res) => {
  const dados = await relatorioEnvioService.cancelar(req.params.id, req.usuario);
  return res.json({ success: true, data: dados });
};

module.exports = { listar, criar, cancelar };
