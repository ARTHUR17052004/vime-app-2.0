const receitaService = require('../services/receitaService');

const listar = async (req, res) => {
  const receitas = await receitaService.listar();
  res.json(receitas);
};

const buscarPorId = async (req, res) => {
  const receita = await receitaService.buscarPorId(req.params.id);

  if (!receita) {
    return res.status(404).json({
      mensagem: 'Receita não encontrada'
    });
  }

  res.json(receita);
};

const criar = async (req, res) => {
  const receita = await receitaService.criar(req.body);

  res.status(201).json(receita);
};

const atualizar = async (req, res) => {
  const receita = await receitaService.atualizar(
    req.params.id,
    req.body
  );

  res.json(receita);
};

const remover = async (req, res) => {
  await receitaService.remover(req.params.id);

  res.json({
    mensagem: 'Receita removida com sucesso'
  });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};