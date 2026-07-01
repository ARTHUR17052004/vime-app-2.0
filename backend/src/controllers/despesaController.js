const despesaService = require('../services/despesaService');

const listar = async (req, res) => {
  const despesas = await despesaService.listar();
  res.json(despesas);
};

const buscarPorId = async (req, res) => {
  const despesa = await despesaService.buscarPorId(req.params.id);

  if (!despesa) {
    return res.status(404).json({
      mensagem: 'Despesa não encontrada'
    });
  }

  res.json(despesa);
};

const criar = async (req, res) => {
  const despesa = await despesaService.criar(req.body);
  res.status(201).json(despesa);
};

const atualizar = async (req, res) => {
  const despesa = await despesaService.atualizar(
    req.params.id,
    req.body
  );

  res.json(despesa);
};

const remover = async (req, res) => {
  await despesaService.remover(req.params.id);

  res.json({
    mensagem: 'Despesa removida com sucesso'
  });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};