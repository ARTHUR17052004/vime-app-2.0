const contaPagamentoService = require('../services/contaPagamentoService');

const listar = async (req, res) => {

  try {

    const contas = await contaPagamentoService.listar();

    return res.json({ success: true, data: contas });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }

};

const criar = async (req, res) => {

  try {

    const conta = await contaPagamentoService.criar(req.body);

    return res.status(201).json({ success: true, data: conta });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

const atualizar = async (req, res) => {

  try {

    const conta = await contaPagamentoService.atualizar(req.params.id, req.body);

    return res.json({ success: true, data: conta });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

const remover = async (req, res) => {

  try {

    await contaPagamentoService.remover(req.params.id);

    return res.json({ success: true, message: 'Conta removida com sucesso.' });

  } catch (error) {

    return res.status(400).json({ success: false, message: error.message });

  }

};

module.exports = {
  listar,
  criar,
  atualizar,
  remover,
};
