const receitaService = require('../services/receitaService');

const listar = async (req, res) => {
  const receitas = await receitaService.listar();

  return res.json({
    success: true,
    data: receitas
  });
};

const buscarPorId = async (req, res) => {

  const receita = await receitaService.buscarPorId(req.params.id);

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

  const receita = await receitaService.criar(req.body);

  return res.status(201).json({
    success: true,
    data: receita
  });

};

const atualizar = async (req, res) => {

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