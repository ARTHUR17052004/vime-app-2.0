const express = require('express');

const router = express.Router();

const locadorController = require('../controllers/locadorController');

router.get('/', locadorController.listar);

router.post('/', locadorController.criar);

router.put('/:id', locadorController.atualizar);

router.delete('/:id', locadorController.remover);

module.exports = router;