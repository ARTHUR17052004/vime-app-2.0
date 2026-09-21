const configuracaoService = require("../services/configuracaoService");

// Configuração é da empresa inteira. Usuário restrito a um locador pode
// ver o que é de tela (tema, nome...), mas nunca senha/token de integração.
const CAMPOS_SECRETOS = ["smtpSenha", "asaasToken", "clicksignToken", "whatsappToken"];

const semSegredos = (usuario, registro) => {

  if (!usuario?.locadorId || !registro) return registro;

  const copia = { ...registro };
  CAMPOS_SECRETOS.forEach((campo) => delete copia[campo]);

  return copia;

};

const listar = async (req, res, next) => {
  try {
    const configuracoes = await configuracaoService.listar();

    return res.json({
      success: true,
      data: configuracoes.map((c) => semSegredos(req.usuario, c)),
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
      data: semSegredos(req.usuario, configuracao),
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