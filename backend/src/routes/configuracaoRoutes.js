const express = require("express");

const router = express.Router();

const configuracaoController = require("../controllers/configuracaoController");
const authMiddleware = require("../middlewares/authMiddleware");

// Pública — a tela de login e o tema precisam ler isso sem estar
// autenticados. Só expõe campos de marca/aparência (ver
// configuracaoService.buscarPublica).
router.get("/publica", configuracaoController.buscarPublica);

router.use(authMiddleware);

router.get("/", configuracaoController.listar);

router.get("/:id", configuracaoController.buscarPorId);

router.post("/", configuracaoController.criar);

router.put("/:id", configuracaoController.atualizar);

router.delete("/:id", configuracaoController.excluir);

module.exports = router;