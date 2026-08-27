const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

const logController = require("../controllers/logController");

router.use(authMiddleware);

router.get("/", permissaoMiddleware('logs.visualizar'), logController.listar);

module.exports = router;