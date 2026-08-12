const express = require("express");

const router = express.Router();

const modeloDocumentoController = require("../controllers/modeloDocumentoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", modeloDocumentoController.listar);

router.get("/:tipo", modeloDocumentoController.buscarPorTipo);

router.put("/:tipo", modeloDocumentoController.salvar);

module.exports = router;
