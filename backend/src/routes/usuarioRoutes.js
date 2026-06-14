const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const perfilMiddleware = require('../middlewares/perfilMiddleware');

router.get('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.listar);

router.post('/', usuarioController.criar);

router.put('/:id', usuarioController.atualizar);

router.delete('/:id', usuarioController.remover);

module.exports = router;