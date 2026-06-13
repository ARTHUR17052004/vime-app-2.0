const kitnetService = require('../services/kitnetService');

const listar = async (req, res) => {
  const kitnets = await kitnetService.listar();
  res.json(kitnets);
};

const criar = async (req, res) => {
  const kitnet = await kitnetService.criar(req.body);
  res.status(201).json(kitnet);
};

const atualizar = async (req, res) => {
  const kitnet = await kitnetService.atualizar(
    req.params.id,
    req.body
  );

  res.json(kitnet);
};

const remover = async (req, res) => {
  await kitnetService.remover(req.params.id);

  res.json({
    mensagem: 'Kitnet removida com sucesso'
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};