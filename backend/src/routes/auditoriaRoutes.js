const express = require("express");

const router = express.Router();

const auditoriaController = require("../controllers/auditoriaController");

const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

router.use(authMiddleware);

router.get("/", permissaoMiddleware('auditoria.visualizar'), auditoriaController.listar);

module.exports = router;