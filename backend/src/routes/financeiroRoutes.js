const express = require('express');

const router = express.Router();

const financeiroController = require('../controllers/financeiroController');

router.get('/fluxo-caixa', financeiroController.fluxoCaixa);

module.exports = router;