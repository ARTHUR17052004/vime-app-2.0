const prisma = require("../config/prisma");

// Usado com router.param("id", escopoRegistro("despesa", filtroDespesa)):
// pra usuário restrito a um locador, qualquer rota com :id daquele módulo
// (ver, editar, excluir...) responde 404 se o registro for de outro
// locador -- a listagem já filtrava, mas o acesso direto pelo id não.
// Quem não tem locador (vê tudo) passa direto, como sempre.
const escopoRegistro = (modelo, filtro) => {

  return async (req, res, next, id) => {

    if (!req.usuario?.locadorId) return next();

    try {

      const existe = await prisma[modelo].findFirst({
        where: { id, ...filtro(req.usuario) },
        select: { id: true },
      });

      if (!existe) {
        return res.status(404).json({
          success: false,
          message: "Registro não encontrado.",
        });
      }

      return next();

    } catch (erro) {

      return next(erro);

    }

  };

};

module.exports = escopoRegistro;
