const express = require('express');

const router = express.Router();

const receitaController = require('../controllers/receitaController');

router.get('/', receitaController.listar);

router.get('/:id', receitaController.buscarPorId);

router.post('/', receitaController.criar);

router.put('/:id', receitaController.atualizar);

router.delete('/:id', receitaController.remover);

module.exports = router;