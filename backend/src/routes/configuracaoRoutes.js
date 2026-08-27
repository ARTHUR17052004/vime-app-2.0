const express = require("express");

const router = express.Router();

const configuracaoController = require("../controllers/configuracaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

// Pública — a tela de login e o tema precisam ler isso sem estar
// autenticados. Só expõe campos de marca/aparência (ver
// configuracaoService.buscarPublica).
router.get("/publica", configuracaoController.buscarPublica);

router.use(authMiddleware);

router.get("/", permissaoMiddleware('configuracoes.visualizar'), configuracaoController.listar);

router.get("/:id", permissaoMiddleware('configuracoes.visualizar'), configuracaoController.buscarPorId);

router.post("/", permissaoMiddleware('configuracoes.editar'), configuracaoController.criar);

router.put("/:id", permissaoMiddleware('configuracoes.editar'), configuracaoController.atualizar);

router.delete("/:id", permissaoMiddleware('configuracoes.editar'), configuracaoController.excluir);

module.exports = router;