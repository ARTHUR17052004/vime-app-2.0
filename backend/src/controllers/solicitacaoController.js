const solicitacaoService = require('../services/solicitacaoService');

const listar = async (req, res) => {

  const solicitacoes = await solicitacaoService.listar();

  res.json(solicitacoes);

};

const buscarPorId = async (req, res) => {

  const solicitacao = await solicitacaoService.buscarPorId(req.params.id);

  if (!solicitacao) {

    return res.status(404).json({
      mensagem: 'Solicitação não encontrada.'
    });

  }

  res.json(solicitacao);

};

const criar = async (req, res) => {

  const solicitacao = await solicitacaoService.criar(req.body);

  res.status(201).json(solicitacao);

};

const atualizar = async (req, res) => {

  const solicitacao = await solicitacaoService.atualizar(
    req.params.id,
    req.body
  );

  res.json(solicitacao);

};

const remover = async (req, res) => {

  await solicitacaoService.remover(req.params.id);

  res.json({
    mensagem: 'Solicitação removida com sucesso.'
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};