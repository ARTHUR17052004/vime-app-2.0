const notificacaoService = require("../services/notificacaoService");
const notificacaoConfigService = require("../services/notificacaoConfigService");

const listarNaoLidas = async (req, res) => {

  const dados = await notificacaoService.listarNaoLidas(req.usuario.id);

  return res.json({
    success: true,
    data: dados,
  });

};

const listarHistorico = async (req, res) => {

  const dados = await notificacaoService.listarHistorico(req.usuario.id);

  return res.json({
    success: true,
    data: dados,
  });

};

const marcarComoLida = async (req, res) => {

  const dados = await notificacaoService.marcarComoLida(req.params.id);

  return res.json({
    success: true,
    data: dados,
  });

};

const marcarTodasComoLidas = async (req, res) => {

  await notificacaoService.marcarTodasComoLidas(req.usuario.id);

  return res.json({
    success: true,
  });

};

const listarConfig = async (req, res) => {

  const dados = await notificacaoConfigService.listar();

  return res.json({ success: true, data: dados });

};

const atualizarConfig = async (req, res) => {

  const dados = await notificacaoConfigService.atualizar(req.params.tipo, req.body || {});

  return res.json({ success: true, data: dados });

};

module.exports = {
  listarConfig,
  atualizarConfig,
  listarNaoLidas,
  listarHistorico,
  marcarComoLida,
  marcarTodasComoLidas,
};