const chamadoService = require('../services/chamadoService');

const listar = async (req, res) => {

  const chamados = await chamadoService.listar();

  res.json(chamados);

};

const buscarPorId = async (req, res) => {

  const chamado = await chamadoService.buscarPorId(req.params.id);

  if (!chamado) {

    return res.status(404).json({
      mensagem: 'Chamado não encontrado.'
    });

  }

  res.json(chamado);

};

const criar = async (req, res) => {

  const chamado = await chamadoService.criar(
    req.body,
    req.usuario
  );

  res.status(201).json(chamado);

};

const atualizar = async (req, res) => {

  const chamado = await chamadoService.atualizar(
    req.params.id,
    req.body
  );

  res.json(chamado);

};

const remover = async (req, res) => {

  await chamadoService.remover(req.params.id);

  res.json({
    mensagem: 'Chamado removido com sucesso.'
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
