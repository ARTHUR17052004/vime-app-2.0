const perfilMiddleware = (...perfisPermitidos) => {
  return (req, res, next) => {

    console.log("========== PERFIL ==========");
    console.log("Usuario:", req.usuario);
    console.log("Perfil recebido:", req.usuario?.perfil);
    console.log("Perfis permitidos:", perfisPermitidos);

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