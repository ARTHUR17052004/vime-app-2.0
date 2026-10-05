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

    // "Locador de trabalho": Administrador/Gerência/Operador enxergam todo
    // mundo por padrão (locadorId null no cadastro), mas podem escolher, só
    // na tela deles, focar num locador só (ARA ou SH) -- manda o id escolhido
    // nesse header, e toda consulta que já filtra por usuario.locadorId
    // (ver escopoLocador.js) passa a respeitar isso sozinha, sem precisar
    // mexer em cada uma. Só vale pra quem já é irrestrito -- Diretoria e
    // qualquer um com locador fixo no cadastro ignora o header (continua
    // só vendo o que já era mostrado pra ele).
    const perfilSemEspaco = (decoded.perfil || "").trim();
    const podeEscolherLocador = !decoded.locadorId && ["ADMINISTRADOR", "GERENCIA", "OPERADOR"].includes(perfilSemEspaco);
    const locadorEscolhido = req.headers["x-locador-filtro"];

    if (podeEscolherLocador && locadorEscolhido) {
      req.usuario = { ...decoded, locadorId: locadorEscolhido };
    }

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
