const express = require('express');

const router = express.Router();

const financeiroController = require('../controllers/financeiroController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('financeiro.visualizar'), financeiroController.resumo);

router.get('/fluxo-caixa', permissaoMiddleware('financeiro.visualizar'), financeiroController.fluxoCaixa);

module.exports = router;