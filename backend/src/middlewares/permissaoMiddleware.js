const prisma = require("../config/prisma");

const temPermissao = async (usuario, chave) => {

  if (!usuario) return false;

  if (usuario.perfil === "ADMINISTRADOR") return true;

  const perfil = await prisma.perfil.findUnique({
    where: { nome: usuario.perfil },
  });

  const permissoes = perfil?.permissoes || [];

  return permissoes.includes(chave);

};

const permissaoMiddleware = (chave) => {

  return async (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado.",
      });
    }

    try {

      const permitido = await temPermissao(req.usuario, chave);

      if (!permitido) {
        return res.status(403).json({
          success: false,
          message: "Você não tem permissão para realizar esta ação.",
        });
      }

      return next();

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erro ao verificar permissão.",
      });

    }

  };

};

module.exports = permissaoMiddleware;
module.exports.temPermissao = temPermissao;
