const signatarioFixoService = require("../services/signatarioFixoService");

const listar = async (req, res) => {
  return res.json({
    success: true,
    data: await signatarioFixoService.listar(),
  });
};

const criar = async (req, res) => {
  const dados = await signatarioFixoService.criar(req.body);

  return res.status(201).json({
    success: true,
    data: dados,
  });
};

const atualizar = async (req, res) => {
  const dados = await signatarioFixoService.atualizar(req.params.id, req.body);

  return res.json({
    success: true,
    data: dados,
  });
};

const excluir = async (req, res) => {
  await signatarioFixoService.excluir(req.params.id);

  return res.json({
    success: true,
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  excluir,
};
