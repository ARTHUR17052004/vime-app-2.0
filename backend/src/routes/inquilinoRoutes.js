const express = require('express');

const router = express.Router();

const inquilinoController = require('../controllers/inquilinoController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('inquilinos.visualizar'), inquilinoController.listar);

router.get('/:id', permissaoMiddleware('inquilinos.visualizar'), inquilinoController.buscarPorId);

router.post('/', permissaoMiddleware('inquilinos.criar'), inquilinoController.criar);

router.put('/:id', permissaoMiddleware('inquilinos.editar'), inquilinoController.atualizar);

router.delete('/:id', permissaoMiddleware('inquilinos.excluir'), inquilinoController.remover);

module.exports = router;