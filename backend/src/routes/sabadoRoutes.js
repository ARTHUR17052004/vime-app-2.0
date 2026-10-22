const express = require("express");

const router = express.Router();

const sabadoController = require("../controllers/sabadoController");

const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

router.use(authMiddleware);

router.get("/resumo-executivo", permissaoMiddleware("sabado.usar"), sabadoController.resumoExecutivo);

module.exports = router;
