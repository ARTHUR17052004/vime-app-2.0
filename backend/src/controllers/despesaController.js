const despesaService = require('../services/despesaService');

const listar = async (req, res) => {

  try {

    const despesas = await despesaService.listar(req.usuario);

    return res.json({
      success: true,
      data: despesas
    });

  } catch (error) {

    console.error("Erro ao listar despesas:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao carregar despesas. Tente recarregar a página."
    });

  }

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

  const despesa = await despesaService.criar(req.body, req.usuario);

  return res.status(201).json({
    success: true,
    data: despesa
  });

};

const atualizar = async (req, res) => {

  const despesa = await despesaService.atualizar(
    req.params.id,
    req.body,
    req.usuario
  );

  return res.json({
    success: true,
    data: despesa
  });

};

const remover = async (req, res) => {

  await despesaService.remover(req.params.id, req.usuario);

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