const inquilinoService = require('../services/inquilinoService');

const listar = async (req, res) => {
  const inquilinos = await inquilinoService.listar();
  res.json(inquilinos);
};

const criar = async (req, res) => {
  const inquilino = await inquilinoService.criar(req.body);
  res.status(201).json(inquilino);
};

const atualizar = async (req, res) => {
  const inquilino = await inquilinoService.atualizar(
    req.params.id,
    req.body
  );

  res.json(inquilino);
};

const remover = async (req, res) => {
  await inquilinoService.remover(req.params.id);

  res.json({
    mensagem: 'Inquilino removido com sucesso'
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};