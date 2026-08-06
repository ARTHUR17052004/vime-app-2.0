const express = require("express");

const router = express.Router();

const whatsappController = require("../controllers/whatsappController");

const authMiddleware = require("../middlewares/authMiddleware");

/* ==========================================
   WEBHOOK META
   (SEM AUTENTICAÇÃO)
========================================== */

router.get("/webhook", whatsappController.validarWebhook);

router.post("/webhook", whatsappController.webhook);

/* ==========================================
   ROTAS PROTEGIDAS
========================================== */

router.use(authMiddleware);

router.get("/status", whatsappController.status);

router.get("/conversas", whatsappController.conversas);

router.post("/sincronizar", whatsappController.sincronizar);

router.get("/configuracao", whatsappController.configuracao);

router.put("/configuracao", whatsappController.salvarConfiguracao);

router.post("/conectar", whatsappController.conectar);

router.post("/qrcode", whatsappController.gerarQrCode);

router.post("/enviar", whatsappController.enviar);

router.post("/receber", whatsappController.receber);

module.exports = router;