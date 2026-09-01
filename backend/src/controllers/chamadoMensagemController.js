const chamadoMensagemService = require("../services/chamadoMensagemService");
const auditoriaService = require("../services/auditoriaService");
const logService = require("../services/logService");

const listar = async (req, res) => {

  const mensagens = await chamadoMensagemService.listar(
    req.params.id
  );

  return res.json({
    success: true,
    data: mensagens,
  });

};

const criar = async (req, res) => {

  const mensagem = await chamadoMensagemService.criar(
    req.params.id,
    req.body,
    req.usuario
  );

  await logService.registrar({
    usuarioId: req.usuario?.id || null,
    usuarioNome: req.usuario?.nome || "Sistema",
    modulo: "SUPORTE",
    acao: req.body.statusAlterado ? "CLASSIFICAR" : "MENSAGEM",
    descricao: req.body.statusAlterado
      ? `Chamado ${req.params.id} marcado como ${req.body.statusAlterado}.`
      : `Nova mensagem no chamado ${req.params.id}.`,
  });

  if (req.body.statusAlterado) {

    await auditoriaService.registrar({
      usuarioId: req.usuario?.id || null,
      usuarioNome: req.usuario?.nome || "Sistema",
      modulo: "SUPORTE",
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
