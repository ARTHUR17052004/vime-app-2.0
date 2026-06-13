const express = require('express');

const router = express.Router();

const inquilinoController = require('../controllers/inquilinoController');

router.get('/', inquilinoController.listar);

router.post('/', inquilinoController.criar);

router.put('/:id', inquilinoController.atualizar);

router.delete('/:id', inquilinoController.remover);

module.exports = router;