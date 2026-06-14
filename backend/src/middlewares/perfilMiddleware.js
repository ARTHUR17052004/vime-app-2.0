const perfilMiddleware = (...perfisPermitidos) => {
  return (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado'
      });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        mensagem: 'Acesso negado'
      });
    }

    next();
  };
};

module.exports = perfilMiddleware;