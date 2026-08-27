const express = require('express');

const router = express.Router();

const receitaController = require('../controllers/receitaController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('financeiro.visualizar'), receitaController.listar);

router.get('/:id', permissaoMiddleware('financeiro.visualizar'), receitaController.buscarPorId);

router.post('/', permissaoMiddleware('financeiro.editar'), receitaController.criar);

router.put('/:id', permissaoMiddleware('financeiro.editar'), receitaController.atualizar);

router.delete('/:id', permissaoMiddleware('financeiro.editar'), receitaController.remover);

module.exports = router;