const express = require('express');

const router = express.Router();

const asaasController = require('../controllers/asaasController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

// Rota pública — chamada pelo próprio Asaas, sem cookie/JWT de sessão.
// A autenticidade é validada por dentro (token asaas-access-token).
router.post("/webhook", asaasController.webhook);

router.use(authMiddleware);

router.get('/config', permissaoMiddleware('asaasConfig.visualizar'), asaasController.config);

router.get('/status', permissaoMiddleware('asaasConfig.visualizar'), asaasController.status);

router.post('/testar-conexao', permissaoMiddleware('asaasConfig.testarConexao'), asaasController.testarConexao);

router.post('/buscar-wallet', permissaoMiddleware('asaasConfig.testarConexao'), asaasController.buscarWallet);

router.get('/transacoes', permissaoMiddleware('asaasTransacoes.visualizar'), asaasController.listarTransacoes);

router.get('/transacoes/:id', permissaoMiddleware('asaasTransacoes.visualizar'), asaasController.buscarTransacao);

router.post('/transacoes/:id/enviar', permissaoMiddleware('asaasTransacoes.enviar'), asaasController.enviarCobranca);

router.get('/resumo', permissaoMiddleware('asaasTransacoes.visualizar'), asaasController.resumo);

router.post('/sincronizar', permissaoMiddleware('asaasConfig.editar'), asaasController.sincronizar);

router.get("/clientes", permissaoMiddleware('asaasTransacoes.visualizar'), asaasController.listarClientes);

router.post("/clientes", permissaoMiddleware('asaasTransacoes.criar'), asaasController.criarCliente);

router.get("/cobrancas", permissaoMiddleware('asaasTransacoes.visualizar'), asaasController.listarCobrancas);

router.post("/cobrancas", permissaoMiddleware('asaasTransacoes.criar'), asaasController.criarCobranca);

router.post("/webhook/token", permissaoMiddleware('asaasConfig.editar'), asaasController.gerarTokenWebhook);

router.post("/webhook/testar", permissaoMiddleware('asaasConfig.testarConexao'), asaasController.testarWebhook);

// Conta Asaas própria de um locador (não a conta padrão do sistema) --
// mesma permissão de testar/editar a config do Asaas.
router.post("/locadores/:id/testar-conexao", permissaoMiddleware('asaasConfig.testarConexao'), asaasController.testarConexaoLocador);

router.post("/locadores/:id/webhook", permissaoMiddleware('asaasConfig.editar'), asaasController.registrarWebhookLocador);

module.exports = router;
