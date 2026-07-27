const express = require('express');

const router = express.Router();

const clicksignController = require('../controllers/clicksignController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/config', clicksignController.config);

router.get('/status', clicksignController.status);

router.get('/documentos', clicksignController.listarDocumentos);

router.get('/documentos/:id', clicksignController.buscarDocumento);

router.post('/documentos', clicksignController.criarDocumento);

router.post('/enviar', clicksignController.enviarDocumento);

router.post('/sincronizar', clicksignController.sincronizar);

module.exports = router;