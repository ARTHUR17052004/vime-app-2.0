const express = require("express");

const router = express.Router();

const whatsappController = require("../controllers/whatsappController");

const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/status", whatsappController.status);

router.post("/enviar", whatsappController.enviar);

router.post("/receber", whatsappController.receber);

router.post("/webhook", whatsappController.webhook);

module.exports = router;