const express = require("express");

const router = express.Router();

const sessaoController = require("../controllers/sessaoController");

const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", sessaoController.listar);

module.exports = router;
