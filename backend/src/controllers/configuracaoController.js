const configuracaoService = require("../services/configuracaoService");

const listar = async (req, res, next) => {
  try {
    const configuracoes = await configuracaoService.listar();

    return res.json({
      success: true,
      data: configuracoes,
    });
  } catch (error) {
    next(error);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const configuracao = await configuracaoService.buscarPorId(req.params.id);

    return res.json({
      success: true,
      data: configuracao,
    });
  } catch (error) {
    next(error);
  }
};

const buscarPublica = async (req, res, next) => {
  try {
    const configuracao = await configuracaoService.buscarPublica();

    return res.json({
      success: true,
      data: configuracao,
    });
  } catch (error) {
    next(error);
  }
};

const criar = async (req, res, next) => {
  try {
    const configuracao = await configuracaoService.criar(req.body);

    return res.status(201).json({
      success: true,
      data: configuracao,
    });
  } catch (error) {
    next(error);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const configuracao = await configuracaoService.atualizar(
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      data: configuracao,
    });
  } catch (error) {
    next(error);
  }
};

const excluir = async (req, res, next) => {
  try {
    await configuracaoService.excluir(req.params.id);

    return res.json({
      success: true,
      message: "Configuração removida com sucesso.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  buscarPorId,
  buscarPublica,
  criar,
  atualizar,
  excluir,
};