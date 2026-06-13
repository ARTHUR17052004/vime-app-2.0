const locadorService = require('../services/locadorService');

const listar = async (req, res) => {
  const locadores = await locadorService.listar();
  res.json(locadores);
};

const criar = async (req, res) => {
  const locador = await locadorService.criar(req.body);
  res.status(201).json(locador);
};

const atualizar = async (req, res) => {
  const locador = await locadorService.atualizar(
    req.params.id,
    req.body
  );

  res.json(locador);
};

const remover = async (req, res) => {
  await locadorService.remover(req.params.id);

  res.json({
    mensagem: 'Locador removido com sucesso'
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};