const express = require("express");

const router = express.Router();

const feriadoController = require("../controllers/feriadoController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");
const { apenasIrrestrito } = require("../middlewares/restricoes");

router.use(authMiddleware);

// Não é por locador (feriado nacional/estadual vale pro sistema
// inteiro) -- só quem administra o sistema inteiro mexe aqui.
router.get("/", permissaoMiddleware('feriados.visualizar'), feriadoController.listar);

router.post("/", apenasIrrestrito, permissaoMiddleware('feriados.editar'), feriadoController.criar);

router.delete("/:id", apenasIrrestrito, permissaoMiddleware('feriados.editar'), feriadoController.remover);

module.exports = router;
