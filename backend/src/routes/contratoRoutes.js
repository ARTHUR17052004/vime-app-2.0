const express = require('express');

const router = express.Router();

const contratoController = require('../controllers/contratoController');

router.get('/', contratoController.listar);

router.get('/:id', contratoController.buscarPorId);

router.post('/', contratoController.criar);

router.put('/:id', contratoController.atualizar);

router.delete('/:id', contratoController.remover);

router.patch('/:id/encerrar', contratoController.encerrar);

router.patch('/:id/inadimplente', contratoController.inadimplente);

router.patch('/:id/renovar', contratoController.renovar);

module.exports = router;

 