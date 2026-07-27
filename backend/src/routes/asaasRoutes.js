const express = require('express');

const router = express.Router();

const asaasController = require('../controllers/asaasController');

const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/config', asaasController.config);

router.get('/status', asaasController.status);

router.post('/testar-conexao', asaasController.testarConexao);

router.post('/buscar-wallet', asaasController.buscarWallet);

router.get('/transacoes', asaasController.listarTransacoes);

router.get('/transacoes/:id', asaasController.buscarTransacao);

router.get('/resumo', asaasController.resumo);

router.post('/sincronizar', asaasController.sincronizar);

module.exports = router;