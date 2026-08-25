const unidadeService = require('../services/unidadeService');

const listar = async (req, res) => {
  const unidades = await unidadeService.listar();
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