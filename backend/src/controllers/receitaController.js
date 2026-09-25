const receitaService = require('../services/receitaService');

// Usuário restrito a um locador não pode mexer numa receita de fora
// da sua área só porque descobriu o id (a listagem já não mostra, mas
// a rota em si não sabia disso até aqui).
const foraDoEscopo = async (req) => {

  if (!req.usuario?.locadorId) return false;

  const receita = await receitaService.buscarPorId(req.params.id, req.usuario);

  return !receita;

};

const listar = async (req, res) => {
  const receitas = await receitaService.listar(req.usuario);

  return res.json({
    success: true,
    data: receitas
  });
};

const buscarPorId = async (req, res) => {

  const receita = await receitaService.buscarPorId(req.params.id, req.usuario);

  if (!receita) {
    return res.status(404).json({
      success: false,
      message: 'Receita não encontrada.'
    });
  }

  return res.json({
    success: true,
    data: receita
  });

};

const criar = async (req, res) => {

  const receita = await receitaService.criar(req.body, req.usuario);

  return res.status(201).json({
    success: true,
    data: receita
  });

};

const atualizar = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      success: false,
      message: 'Receita não encontrada.'
    });
  }

  const receita = await receitaService.atualizar(
    req.params.id,
    req.body
  );

  return res.json({
    success: true,
    data: receita
  });

};

const remover = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      success: false,
      message: 'Receita não encontrada.'
    });
  }

  await receitaService.remover(req.params.id);

  return res.json({
    success: true,
    message: 'Receita removida com sucesso.'
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};