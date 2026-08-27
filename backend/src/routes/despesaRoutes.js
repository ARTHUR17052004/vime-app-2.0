const express = require('express');

const router = express.Router();

const despesaController = require('../controllers/despesaController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('financeiro.visualizar'), despesaController.listar);

router.get('/:id', permissaoMiddleware('financeiro.visualizar'), despesaController.buscarPorId);

router.post('/', permissaoMiddleware('financeiro.editar'), despesaController.criar);

router.put('/:id', permissaoMiddleware('financeiro.editar'), despesaController.atualizar);

router.delete('/:id', permissaoMiddleware('financeiro.editar'), despesaController.remover);

module.exports = router;