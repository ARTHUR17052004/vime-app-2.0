const express = require("express");

const router = express.Router();

const notificacaoController = require("../controllers/notificacaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const { apenasAdministradorGeral } = require("../middlewares/restricoes");

router.use(authMiddleware);

// Escolha do que notificar (tela Administração > Notificações).
router.get("/config", apenasAdministradorGeral, notificacaoController.listarConfig);

router.put("/config/:tipo", apenasAdministradorGeral, notificacaoController.atualizarConfig);

router.get("/nao-lidas", notificacaoController.listarNaoLidas);

router.get("/historico", notificacaoController.listarHistorico);

router.put("/:id/ler", notificacaoController.marcarComoLida);

router.put("/ler-todas", notificacaoController.marcarTodasComoLidas);

module.exports = router;