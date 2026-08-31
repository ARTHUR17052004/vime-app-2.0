const despesaService = require('../services/despesaService');

const listar = async (req, res) => {

  const despesas = await despesaService.listar(req.usuario);

  return res.json({
    success: true,
    data: despesas
  });

};

const buscarPorId = async (req, res) => {

  const despesa = await despesaService.buscarPorId(req.params.id);

  if (!despesa) {
    return res.status(404).json({
      success: false,
      message: 'Despesa não encontrada.'
    });
  }

  return res.json({
    success: true,
    data: despesa
  });

};

const criar = async (req, res) => {

  const despesa = await despesaService.criar(req.body);

  return res.status(201).json({
    success: true,
    data: despesa
  });

};

const atualizar = async (req, res) => {

  const despesa = await despesaService.atualizar(
    req.params.id,
    req.body
  );

  return res.json({
    success: true,
    data: despesa
  });

};

const remover = async (req, res) => {

  await despesaService.remover(req.params.id);

  return res.json({
    success: true,
    message: 'Despesa removida com sucesso.'
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};