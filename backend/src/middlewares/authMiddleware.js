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

    // perfil/locadorId/ativo vêm SEMPRE frescos do banco, nunca do JWT --
    // o token só prova quem é (id). O JWT é assinado no login e dura até
    // 30 dias no app instalado (ver authService.criarSessao); se
    // confiássemos nesses campos dele, um usuário realocado de locador
    // (ex.: SH -> ARA) ou desativado continuaria com o acesso ANTIGO até
    // o token vencer ou ele deslogar/logar de novo -- foi exatamente
    // assim que um contrato da SH vazou pra um usuário já da ARA no
    // mobile (token de 30 dias, nunca relogou). Mesmo princípio que
    // permissaoMiddleware já aplica pras permissões do perfil.
    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { perfil: true },
    });

    if (!usuarioAtual || !usuarioAtual.ativo) {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida. Faça login novamente.",
      });
    }

    // "Locador de trabalho": Administrador/Gerência/Operador enxergam todo
    // mundo por padrão (locadorId null no cadastro), mas podem escolher, só
    // na tela deles, focar num locador só (ARA ou SH) -- manda o id escolhido
    // nesse header, e toda consulta que já filtra por usuario.locadorId
    // (ver escopoLocador.js) passa a respeitar isso sozinha, sem precisar
    // mexer em cada uma. Só vale pra quem já é irrestrito -- Diretoria e
    // qualquer um com locador fixo no cadastro ignora o header (continua
    // só vendo o que já era mostrado pra ele).
    const perfilSemEspaco = (usuarioAtual.perfil?.nome || "").trim();
    const podeEscolherLocador = !usuarioAtual.locadorId && ["ADMINISTRADOR", "GERENCIA", "OPERADOR"].includes(perfilSemEspaco);
    const locadorEscolhido = req.headers["x-locador-filtro"];

    // Guardado à parte (não dá pra reconstruir depois de locadorId já ter
    // sido sobrescrito abaixo) -- usado pelo SABADO (ver
    // sabadoFerramentasService.js) pra saber se pode trocar de locador
    // dentro da própria pergunta ("quantas vazias tem na ARA?") ou se
    // esse usuário só enxerga o locador fixo dele mesmo.
    req.usuario = {
      id: usuarioAtual.id,
      nome: usuarioAtual.nome,
      email: usuarioAtual.email,
      perfil: perfilSemEspaco,
      perfilId: usuarioAtual.perfilId || null,
      ativo: usuarioAtual.ativo,
      locadorId: usuarioAtual.locadorId || null,
      podeEscolherLocador,
    };

    if (podeEscolherLocador && locadorEscolhido) {
      req.usuario = { ...req.usuario, locadorId: locadorEscolhido };
    }

    // Modo manutenção: só o Administrador continua passando -- todo o
    // resto (mesmo já logado) é barrado até ele desligar de novo.
    if (perfilSemEspaco !== "ADMINISTRADOR") {

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
