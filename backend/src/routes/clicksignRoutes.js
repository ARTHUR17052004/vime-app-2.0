const express = require('express');

const router = express.Router();

const clicksignController = require('../controllers/clicksignController');
const authMiddleware = require('../middlewares/authMiddleware');

// Webhook fica FORA da autenticação de usuário —
// quem chama essa rota é o servidor da ClickSign, não um usuário logado
router.post('/webhook', clicksignController.webhook);

// Todas as rotas abaixo continuam exigindo login
router.use(authMiddleware);

router.get('/config', clicksignController.config);

router.get('/status', clicksignController.status);

router.post('/testar-conexao', clicksignController.testarConexao);

router.post('/enviar', clicksignController.enviarDocumento);

router.post('/sincronizar', clicksignController.sincronizar);

router.get("/documentos", clicksignController.listarDocumentosApi);

router.post("/documentos", clicksignController.criarDocumentoApi);

router.get("/documentos/:id", clicksignController.buscarDocumentoApi);

router.delete("/documentos/:id", clicksignController.cancelarDocumento);

router.post(
  "/documentos/:id/assinar",
  clicksignController.enviarAssinatura
);

module.exports = router;