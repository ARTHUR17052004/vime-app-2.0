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

// Confirmar que uma receita/despesa foi paga é um ponto sensível (é
// literalmente dizer "o dinheiro entrou/saiu") -- quem só tem
// financeiro.editar não pode sozinho fazer isso, precisa também de
// financeiro.marcarPago. Só entra em ação quando o pedido tenta
// DEIXAR o registro como PAGO/PAGA; editar qualquer outro campo (ou
// mudar pra outro status) segue exigindo só financeiro.editar, como
// já era.
const exigirPermissaoParaMarcarPago = async (req, res, next) => {

  const statusNovo = String(req.body?.status || "").toUpperCase();

  if (statusNovo !== "PAGO" && statusNovo !== "PAGA") {
    return next();
  }

  try {

    const permitido = await temPermissao(req.usuario, "financeiro.marcarPago");

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para marcar isso como pago.",
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

module.exports = permissaoMiddleware;
module.exports.temPermissao = temPermissao;
module.exports.exigirPermissaoParaMarcarPago = exigirPermissaoParaMarcarPago;
