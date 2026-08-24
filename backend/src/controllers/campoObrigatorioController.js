const campoObrigatorioService = require('../services/campoObrigatorioService');

const listar = async (req, res) => {
  const dados = await campoObrigatorioService.listarPorModulo(req.params.modulo);

  return res.json({
    success: true,
    data: dados,
  });
};

const salvar = async (req, res) => {
  const dados = await campoObrigatorioService.salvar(req.params.modulo, req.body.campos);

  return res.json({
    success: true,
    data: dados,
  });
};

module.exports = {
  listar,
  salvar,
};
