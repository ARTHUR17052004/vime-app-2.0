const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');

const buscaController = require('../controllers/buscaController');

const router = express.Router();

router.get('/', authMiddleware, buscaController.buscar);

module.exports = router;
