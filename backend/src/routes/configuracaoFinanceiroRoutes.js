const express = require("express");

const router = express.Router();

const configuracaoFinanceiroController = require("../controllers/configuracaoFinanceiroController");

const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

router.use(authMiddleware);

router.get("/", permissaoMiddleware("financeiro.visualizar"), configuracaoFinanceiroController.buscar);
router.put("/", permissaoMiddleware("financeiro.editar"), configuracaoFinanceiroController.atualizar);

module.exports = router;
