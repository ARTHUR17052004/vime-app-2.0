const express = require("express");

const router = express.Router();

const pushController = require("../controllers/pushController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/chave-publica", pushController.chavePublica);

router.post("/inscrever", pushController.inscrever);

router.post("/desinscrever", pushController.desinscrever);

module.exports = router;
