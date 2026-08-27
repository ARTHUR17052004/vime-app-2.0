const express = require('express');

const router = express.Router();

const kitnetController = require('../controllers/kitnetController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('kitnets.visualizar'), kitnetController.listar);

router.post('/', permissaoMiddleware('kitnets.criar'), kitnetController.criar);

router.put('/:id', permissaoMiddleware('kitnets.editar'), kitnetController.atualizar);

router.delete('/:id', permissaoMiddleware('kitnets.excluir'), kitnetController.remover);

module.exports = router;