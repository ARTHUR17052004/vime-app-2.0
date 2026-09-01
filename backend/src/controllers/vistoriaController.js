const vistoriaService = require('../services/vistoriaService');

const listar = async (req, res) => {
  const dados = await vistoriaService.listar(req.usuario);
  res.json(dados);
};

const buscarPorId = async (req, res) => {

  const vistoria = await vistoriaService.buscarPorId(req.params.id);

  if (!vistoria) {
    return res.status(404).json({
      mensagem: 'Vistoria não encontrada.'
    });
  }

  res.json(vistoria);

};

const criar = async (req, res) => {
  const vistoria = await vistoriaService.criar(req.body);
  res.status(201).json(vistoria);
};

const atualizar = async (req, res) => {

  const vistoria = await vistoriaService.atualizar(
    req.params.id,
    req.body
  );

  res.json(vistoria);

};

const remover = async (req, res) => {

  await vistoriaService.remover(req.params.id);

  res.json({
    mensagem: 'Vistoria removida com sucesso.'
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};