const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const perfilMiddleware = require('../middlewares/perfilMiddleware');

router.get('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.listar);

router.post('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.criar);

router.put('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.atualizar);

router.delete('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.remover);

module.exports = router;