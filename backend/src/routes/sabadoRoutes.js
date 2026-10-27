const express = require("express");

const router = express.Router();

const sabadoController = require("../controllers/sabadoController");

const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

router.use(authMiddleware);

router.get("/resumo-executivo", permissaoMiddleware("sabado.usar"), sabadoController.resumoExecutivo);
router.post("/chat", permissaoMiddleware("sabado.usar"), sabadoController.chat);
router.get("/conversas", permissaoMiddleware("sabado.usar"), sabadoController.listarConversas);
router.get("/conversas/:id", permissaoMiddleware("sabado.usar"), sabadoController.buscarConversa);
router.delete("/conversas/:id", permissaoMiddleware("sabado.usar"), sabadoController.excluirConversa);

module.exports = router;
