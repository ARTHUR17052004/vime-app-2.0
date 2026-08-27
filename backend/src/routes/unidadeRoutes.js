const express = require('express');

const router = express.Router();

const unidadeController = require('../controllers/unidadeController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('unidades.visualizar'), unidadeController.listar);

router.post('/', permissaoMiddleware('unidades.criar'), unidadeController.criar);

router.put('/:id', permissaoMiddleware('unidades.editar'), unidadeController.atualizar);

router.delete('/:id', permissaoMiddleware('unidades.excluir'), unidadeController.remover);

module.exports = router;