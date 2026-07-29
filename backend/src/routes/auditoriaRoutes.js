const express = require("express");

const router = express.Router();

const auditoriaController = require("../controllers/auditoriaController");

const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", auditoriaController.listar);

module.exports = router;