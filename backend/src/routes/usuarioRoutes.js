const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, usuarioController.listar);

router.post('/', usuarioController.criar);

router.put('/:id', usuarioController.atualizar);

router.delete('/:id', usuarioController.remover);

module.exports = router;