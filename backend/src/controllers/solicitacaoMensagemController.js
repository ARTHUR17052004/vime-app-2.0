const solicitacaoMensagemService = require("../services/solicitacaoMensagemService");
const auditoriaService = require("../services/auditoriaService");
const logService = require("../services/logService");
const { temPermissao } = require("../middlewares/permissaoMiddleware");

const listar = async (req, res) => {

  const mensagens = await solicitacaoMensagemService.listar(
    req.params.id
  );

  return res.json({
    success: true,
    data: mensagens,
  });

};

const criar = async (req, res) => {

  if (req.body.statusAlterado) {

    const permitido = await temPermissao(
      req.usuario,
      "solicitacoes.classificar"
    );

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para classificar solicitações.",
      });
    }

  }

  const mensagem = await solicitacaoMensagemService.criar(
    req.params.id,
    req.body,
    req.usuario
  );

  await logService.registrar({
    usuarioId: req.usuario?.id || null,
    usuarioNome: req.usuario?.nome || "Sistema",
    modulo: "SOLICITACOES",
    acao: req.body.statusAlterado ? "CLASSIFICAR" : "MENSAGEM",
    descricao: req.body.statusAlterado
      ? `Solicitação ${req.params.id} classificada como ${req.body.statusAlterado}.`
      : `Nova mensagem na solicitação ${req.params.id}.`,
  });

  if (req.body.statusAlterado) {

    await auditoriaService.registrar({
      usuarioId: req.usuario?.id || null,
      usuarioNome: req.usuario?.nome || "Sistema",
      modulo: "SOLICITACOES",
      registroId: req.params.id,
      acao: "CLASSIFICAR",
      valorAnterior: null,
      valorNovo: { status: req.body.statusAlterado },
    });

  }

  return res.status(201).json({
    success: true,
    data: mensagem,
  });

};

module.exports = {
  listar,
  criar,
};
