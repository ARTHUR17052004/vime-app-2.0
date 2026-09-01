const express = require('express');

const router = express.Router();

const chamadoController = require('../controllers/chamadoController');
const chamadoMensagemController = require('../controllers/chamadoMensagemController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('suporte.visualizar'), chamadoController.listar);

router.get('/:id', permissaoMiddleware('suporte.visualizar'), chamadoController.buscarPorId);

router.post('/', permissaoMiddleware('suporte.criar'), chamadoController.criar);

router.put('/:id', permissaoMiddleware('suporte.editar'), chamadoController.atualizar);

router.delete('/:id', permissaoMiddleware('suporte.excluir'), chamadoController.remover);

router.get('/:id/mensagens', permissaoMiddleware('suporte.visualizar'), chamadoMensagemController.listar);

router.post('/:id/mensagens', permissaoMiddleware('suporte.visualizar'), chamadoMensagemController.criar);

module.exports = router;
