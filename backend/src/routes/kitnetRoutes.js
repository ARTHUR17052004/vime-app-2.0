const express = require('express');

const router = express.Router();

const kitnetController = require('../controllers/kitnetController');

router.get('/', kitnetController.listar);

router.post('/', kitnetController.criar);

router.put('/:id', kitnetController.atualizar);

router.delete('/:id', kitnetController.remover);

module.exports = router;