const express = require('express');

const router = express.Router();

const financeiroController = require('../controllers/financeiroController');

const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', financeiroController.resumo);

router.get('/fluxo-caixa', financeiroController.fluxoCaixa);

module.exports = router;