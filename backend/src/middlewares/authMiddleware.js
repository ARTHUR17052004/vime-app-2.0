const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  // O header vem da guia (cada uma com o seu usuário); o cookie é um só pro
  // navegador inteiro e só serve de reserva -- se ele vencesse, logar em outra
  // guia trocava o usuário das demais.
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token não informado.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "vime_secret_dev"
    );

    req.usuario = decoded;

    // Modo manutenção: só o Administrador continua passando -- todo o
    // resto (mesmo já logado) é barrado até ele desligar de novo.
    if (decoded.perfil !== "ADMINISTRADOR") {

      const configuracao = await prisma.configuracao.findFirst({
        orderBy: { id: "asc" },
      });

      if (configuracao?.manutencaoAtiva) {
        return res.status(503).json({
          success: false,
          manutencao: true,
          message:
            configuracao.manutencaoMensagem ||
            "O sistema está em manutenção no momento. Tente novamente em breve.",
        });
      }

    }

    next();
  } catch (err) {
    console.log("Erro JWT:", err.message);

    return res.status(401).json({
      success: false,
      message: "Token inválido.",
    });
  }
};

module.exports = authMiddleware;
