const kitnetService = require('../services/kitnetService');

// Usuário restrito a um locador não pode mexer numa kitnet de fora da
// sua área só porque descobriu o id.
const foraDoEscopo = async (req) => {

  if (!req.usuario?.locadorId) return false;

  const kitnet = await kitnetService.buscarPorId(req.params.id);

  return !kitnet || kitnet.unidade?.locadorId !== req.usuario.locadorId;

};

const listar = async (req, res) => {
  const kitnets = await kitnetService.listar(req.usuario);
  res.json(kitnets);
};

const criar = async (req, res) => {
  const kitnet = await kitnetService.criar(req.body, req.usuario);
  res.status(201).json(kitnet);
};

const atualizar = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      mensagem: 'Kitnet não encontrada.'
    });
  }

  const kitnet = await kitnetService.atualizar(
    req.params.id,
    req.body
  );

  res.json(kitnet);
};

const remover = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      mensagem: 'Kitnet não encontrada.'
    });
  }

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