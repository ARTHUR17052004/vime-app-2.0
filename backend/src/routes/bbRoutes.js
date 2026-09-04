const express = require('express');

const router = express.Router();

const bbController = require('../controllers/bbController');

// Rota pública -- chamada pelo próprio Banco do Brasil, sem cookie/JWT
// de sessão (mesmo padrão do webhook da Asaas).
router.post('/webhook', bbController.webhook);

module.exports = router;
