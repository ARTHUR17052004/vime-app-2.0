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

const listarMissoes = async (req, res) => {
  const dados = await vistoriaService.listarMissoes(req.params.id);
  res.json(dados);
};

const concluirMissoes = async (req, res) => {
  const dados = await vistoriaService.concluirMissoes(req.params.id, req.body);
  res.json(dados);
};

const cancelarRealizacao = async (req, res) => {
  const dados = await vistoriaService.cancelarRealizacao(req.params.id);
  res.json(dados);
};

const listarMissoesRealizadas = async (req, res) => {
  const dados = await vistoriaService.listarMissoesRealizadas();
  res.json(dados);
};

const atualizarMissao = async (req, res) => {
  const dados = await vistoriaService.atualizarMissao(req.params.missaoId, req.body);
  res.json(dados);
};

const removerMissao = async (req, res) => {
  await vistoriaService.removerMissao(req.params.missaoId);
  res.json({ mensagem: 'Registro removido com sucesso.' });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  listarMissoes,
  concluirMissoes,
  cancelarRealizacao,
  listarMissoesRealizadas,
  atualizarMissao,
  removerMissao,
};