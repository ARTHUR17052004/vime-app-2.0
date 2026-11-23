const feriadoService = require("../services/feriadoService");

const listar = async (req, res) => {
  const dados = await feriadoService.listar(req.query.ano);
  res.json({ success: true, data: dados });
};

const criar = async (req, res) => {
  const dados = await feriadoService.criar(req.body, req.usuario);
  res.json({ success: true, data: dados });
};

const remover = async (req, res) => {
  const dados = await feriadoService.remover(req.params.id, req.usuario);
  res.json({ success: true, data: dados });
};

module.exports = {
  listar,
  criar,
  remover,
};
