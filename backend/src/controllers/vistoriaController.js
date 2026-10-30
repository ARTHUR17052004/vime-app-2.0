const vistoriaService = require('../services/vistoriaService');
const notificacaoService = require('../services/notificacaoService');

const listar = async (req, res) => {
  const dados = await vistoriaService.listar(req.usuario);
  res.json(dados);
};

const buscarPorId = async (req, res) => {

  const vistoria = await vistoriaService.buscarPorId(req.params.id);

  if (!vistoria) {

    // Auto-cura: uma vistoria "some" quando o Kitnet/Unidade dela é
    // excluído (cascade no banco) sem passar por vistoriaService.remover
    // -- e aí fica notificação velha ("Vistoria pendente"/"urgente")
    // apontando pra um link que não existe mais, pra sempre. Limpa aqui
    // pra não ficar reaparecendo "não encontrada" toda vez que alguém
    // clicar de novo na mesma notificação.
    try {
      await notificacaoService.removerPorLink(`/vistorias/${req.params.id}`);
    } catch (erro) {
      console.error('[notificacao] Falha ao limpar notificação órfã de vistoria:', erro.message);
    }

    return res.status(404).json({
      mensagem: 'Vistoria não encontrada.'
    });
  }

  res.json(vistoria);

};

const criar = async (req, res) => {
  const vistoria = await vistoriaService.criar(req.body, req.usuario);
  res.status(201).json(vistoria);
};

const atualizar = async (req, res) => {

  const vistoria = await vistoriaService.atualizar(
    req.params.id,
    req.body,
    req.usuario
  );

  res.json(vistoria);

};

const remover = async (req, res) => {

  await vistoriaService.remover(req.params.id, req.usuario);

  res.json({
    mensagem: 'Vistoria removida com sucesso.'
  });

};

const listarMissoes = async (req, res) => {
  const dados = await vistoriaService.listarMissoes(req.params.id);
  res.json(dados);
};

const concluirMissoes = async (req, res) => {
  const dados = await vistoriaService.concluirMissoes(req.params.id, req.body, req.usuario);
  res.json(dados);
};

const cancelarRealizacao = async (req, res) => {
  const dados = await vistoriaService.cancelarRealizacao(req.params.id, req.usuario);
  res.json(dados);
};

const listarMissoesRealizadas = async (req, res) => {
  const dados = await vistoriaService.listarMissoesRealizadas();
  res.json(dados);
};

const buscarMissao = async (req, res) => {

  const missao = await vistoriaService.buscarMissao(req.params.missaoId);

  if (!missao) {
    return res.status(404).json({ mensagem: 'Registro não encontrado.' });
  }

  res.json(missao);

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
  buscarMissao,
  atualizarMissao,
  removerMissao,
};