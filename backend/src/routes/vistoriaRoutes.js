const express = require('express');

const router = express.Router();

const vistoriaController = require('../controllers/vistoriaController');

const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', vistoriaController.listar);

router.get('/:id', vistoriaController.buscarPorId);

router.post('/', vistoriaController.criar);

router.put('/:id', vistoriaController.atualizar);

router.delete('/:id', vistoriaController.remover);

module.exports = router;