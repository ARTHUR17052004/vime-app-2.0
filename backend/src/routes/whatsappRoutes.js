const express = require("express");

const router = express.Router();

const whatsappController = require("../controllers/whatsappController");
const authMiddleware = require("../middlewares/authMiddleware");

// Webhook fica FORA da autenticação de usuário —
// quem chama essa rota é a Meta (WhatsApp), não um usuário logado
router.post("/webhook", whatsappController.webhook);

// Todas as rotas abaixo continuam exigindo login
router.use(authMiddleware);

router.get("/status", whatsappController.status);
router.post("/enviar", whatsappController.enviar);
router.post("/receber", whatsappController.receber);

module.exports = router;