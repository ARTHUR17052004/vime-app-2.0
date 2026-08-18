const express = require('express');

const router = express.Router();

const contratoController = require('../controllers/contratoController');

const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', contratoController.listar);

router.get('/:id', contratoController.buscarPorId);

router.get('/:id/pdf', contratoController.baixarPdf);

router.post('/', contratoController.criar);

router.put('/:id', contratoController.atualizar);

router.delete('/:id', contratoController.remover);

router.patch('/:id/encerrar', contratoController.encerrar);

router.patch('/:id/renovar', contratoController.renovar);

module.exports = router;