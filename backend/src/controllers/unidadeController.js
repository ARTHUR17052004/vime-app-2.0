const unidadeService = require('../services/unidadeService');

// Usuário restrito a um locador não pode mexer numa residência de fora
// da sua área só porque descobriu o id (a listagem já não mostra, mas
// a rota em si não sabia disso até aqui).
const foraDoEscopo = async (req) => {

  if (!req.usuario?.locadorId) return false;

  const unidade = await unidadeService.buscarPorId(req.params.id);

  return !unidade || unidade.locadorId !== req.usuario.locadorId;

};

const listar = async (req, res) => {
  const unidades = await unidadeService.listar(req.usuario);
  res.json(unidades);
};

const criar = async (req, res) => {
  const unidade = await unidadeService.criar(req.body);
  res.status(201).json(unidade);
};

const atualizar = async (req, res) => {

  if (req.usuario?.perfil !== 'ADMINISTRADOR') {
    return res.status(403).json({
      message: 'Apenas o Administrador pode editar uma residência depois de criada.'
    });
  }

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      message: 'Residência não encontrada.'
    });
  }

  const unidade = await unidadeService.atualizar(
    req.params.id,
    req.body
  );

  res.json(unidade);
};

const remover = async (req, res) => {

  if (req.usuario?.perfil !== 'ADMINISTRADOR') {
    return res.status(403).json({
      message: 'Apenas o Administrador pode excluir uma residência depois de criada.'
    });
  }

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      message: 'Residência não encontrada.'
    });
  }

  await unidadeService.remover(req.params.id);

  res.json({
    mensagem: 'Unidade removida com sucesso'
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};