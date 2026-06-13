const express = require('express');

const router = express.Router();

const unidadeController = require('../controllers/unidadeController');

router.get('/', unidadeController.listar);

router.post('/', unidadeController.criar);

router.put('/:id', unidadeController.atualizar);

router.delete('/:id', unidadeController.remover);

module.exports = router;