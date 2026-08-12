const express = require('express');

const router = express.Router();

const asaasController = require('../controllers/asaasController');

const authMiddleware = require('../middlewares/authMiddleware');

// Rota pública — chamada pelo próprio Asaas, sem cookie/JWT de sessão.
// A autenticidade é validada por dentro (token asaas-access-token).
router.post("/webhook", asaasController.webhook);

router.use(authMiddleware);

router.get('/config', asaasController.config);

router.get('/status', asaasController.status);

router.post('/testar-conexao', asaasController.testarConexao);

router.post('/buscar-wallet', asaasController.buscarWallet);

router.get('/transacoes', asaasController.listarTransacoes);

router.get('/transacoes/:id', asaasController.buscarTransacao);

router.post('/transacoes/:id/enviar', asaasController.enviarCobranca);

router.get('/resumo', asaasController.resumo);

router.post('/sincronizar', asaasController.sincronizar);

router.get("/clientes", asaasController.listarClientes);

router.post("/clientes", asaasController.criarCliente);

router.get("/cobrancas", asaasController.listarCobrancas);

router.post("/cobrancas", asaasController.criarCobranca);

router.post("/webhook/token", asaasController.gerarTokenWebhook);

router.post("/webhook/testar", asaasController.testarWebhook);

module.exports = router;
