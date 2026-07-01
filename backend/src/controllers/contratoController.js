const contratoService = require('../services/contratoService');

const listar = async (req, res) => {
  const contratos = await contratoService.listar();
  res.json(contratos);
};

const buscarPorId = async (req, res) => {
  const contrato = await contratoService.buscarPorId(req.params.id);

  if (!contrato) {
    return res.status(404).json({
      mensagem: 'Contrato não encontrado'
    });
  }

  res.json(contrato);
};

const criar = async (req, res) => {
  const contrato = await contratoService.criar(req.body);
  res.status(201).json(contrato);
};

const atualizar = async (req, res) => {
  const contrato = await contratoService.atualizar(
    req.params.id,
    req.body
  );

  res.json(contrato);
};

const remover = async (req, res) => {
  await contratoService.remover(req.params.id);

  res.json({
    mensagem: 'Contrato removido com sucesso'
  });
};

const encerrar = async (req, res) => {
  const contrato = await contratoService.encerrar(req.params.id);

  res.json(contrato);
};

const inadimplente = async (req, res) => {
  const contrato = await contratoService.inadimplente(req.params.id);

  res.json(contrato);
};

const renovar = async (req, res) => {
  const contrato = await contratoService.renovar(
    req.params.id,
    req.body
  );

  res.json(contrato);
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  encerrar,
  inadimplente,
  renovar
};