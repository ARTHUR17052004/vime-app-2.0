const biometriaService = require("../services/biometriaService");

const responder = (fn, status = 200) => async (req, res) => {
  try {
    const data = await fn(req);
    return res.status(status).json({ success: true, data });
  } catch (erro) {
    return res.status(400).json({ success: false, message: erro.message });
  }
};

module.exports = {
  opcoesDeRegistro: responder((req) => biometriaService.opcoesDeRegistro(req.usuario, req)),
  verificarRegistro: responder(async (req) => {
    await biometriaService.verificarRegistro(req.usuario, req);
    return { ativada: true };
  }),
  opcoesDeLogin: responder((req) => biometriaService.opcoesDeLogin(req)),
  verificarLogin: async (req, res) => {
    try {
      const resultado = await biometriaService.verificarLogin(req);
      return res.status(200).json({ success: true, data: resultado });
    } catch (erro) {
      return res.status(401).json({ success: false, message: erro.message });
    }
  },
  listar: responder((req) => biometriaService.listar(req.usuario.id)),
  remover: responder(async (req) => {
    await biometriaService.remover(req.usuario.id, req.params.id);
    return { removida: true };
  }),
};
