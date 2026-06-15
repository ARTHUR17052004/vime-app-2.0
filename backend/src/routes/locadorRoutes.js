const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');

const perfilMiddleware = require('../middlewares/perfilMiddleware');

const router = express.Router();

const locadorController = require('../controllers/locadorController');

router.get('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), locadorController.listar);

router.post('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), locadorController.criar);

router.put('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), locadorController.atualizar);

router.delete('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), locadorController.remover);

module.exports = router;