const notificacaoService = require("../services/notificacaoService");

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

module.exports = {
  listarNaoLidas,
  listarHistorico,
  marcarComoLida,
  marcarTodasComoLidas,
};