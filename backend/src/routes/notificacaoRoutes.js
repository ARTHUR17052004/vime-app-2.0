const express = require("express");

const router = express.Router();

const notificacaoController = require("../controllers/notificacaoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/nao-lidas", notificacaoController.listarNaoLidas);

router.get("/historico", notificacaoController.listarHistorico);

router.put("/:id/ler", notificacaoController.marcarComoLida);

router.put("/ler-todas", notificacaoController.marcarTodasComoLidas);

module.exports = router;