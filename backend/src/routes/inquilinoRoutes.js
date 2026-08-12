const express = require('express');

const router = express.Router();

const inquilinoController = require('../controllers/inquilinoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', inquilinoController.listar);

router.get('/:id', inquilinoController.buscarPorId);

router.post('/', inquilinoController.criar);

router.put('/:id', inquilinoController.atualizar);

router.delete('/:id', inquilinoController.remover);

module.exports = router;