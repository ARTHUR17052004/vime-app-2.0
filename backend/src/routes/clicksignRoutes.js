const express = require('express');

const router = express.Router();

const clicksignController = require('../controllers/clicksignController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/config', clicksignController.config);

router.get('/status', clicksignController.status);

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

router.post(
  "/webhook",
  clicksignController.webhook
);

module.exports = router;