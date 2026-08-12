const perfilMiddleware = (...perfisPermitidos) => {
  return (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado"
      });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado"
      });
    }

    next();
  };
};

module.exports = perfilMiddleware;