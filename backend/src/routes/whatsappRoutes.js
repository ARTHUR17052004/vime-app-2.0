const express = require("express");

const router = express.Router();

const whatsappController = require("../controllers/whatsappController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");
const { temPermissao } = require("../middlewares/permissaoMiddleware");

// Webhook fica FORA da autenticação de usuário —
// quem chama essa rota é a Meta (WhatsApp), não um usuário logado
router.get("/webhook", whatsappController.validarWebhook);
router.post("/webhook", whatsappController.webhook);

// Todas as rotas abaixo continuam exigindo login
router.use(authMiddleware);

// PUT /configuracao serve tanto pra conexão (nomeConexao/numero/token...)
// quanto pro assistente de IA (iaAtivo/iaApiKey) -- olha quais campos
// vieram no corpo pra exigir a permissão certa de cada um.
async function permissaoConfiguracaoWhatsapp(req, res, next) {

  const mexeNaIA = "iaAtivo" in req.body || "iaApiKey" in req.body;
  const chave = mexeNaIA ? "whatsapp.assistenteConfigurar" : "whatsapp.configurar";

  const permitido = await temPermissao(req.usuario, chave);

  if (!permitido) {
    return res.status(403).json({
      success: false,
      message: "Você não tem permissão para realizar esta ação."
    });
  }

  return next();

}

router.get("/status", permissaoMiddleware('whatsapp.visualizar'), whatsappController.status);
router.get("/configuracao", permissaoMiddleware('whatsapp.visualizar'), whatsappController.configuracao);
router.put("/configuracao", permissaoConfiguracaoWhatsapp, whatsappController.salvarConfiguracao);
router.get("/conversas", permissaoMiddleware('whatsapp.visualizar'), whatsappController.conversas);
router.post("/conectar", permissaoMiddleware('whatsapp.conectar'), whatsappController.conectar);
router.post("/qrcode", permissaoMiddleware('whatsapp.conectar'), whatsappController.gerarQrCode);
router.post("/sincronizar", permissaoMiddleware('whatsapp.conectar'), whatsappController.sincronizar);
router.post("/enviar", permissaoMiddleware('whatsapp.enviar'), whatsappController.enviar);
router.post("/receber", permissaoMiddleware('whatsapp.enviar'), whatsappController.receber);

module.exports = router;