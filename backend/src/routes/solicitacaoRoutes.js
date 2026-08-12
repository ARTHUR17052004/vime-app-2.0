const express = require('express');

const router = express.Router();

const solicitacaoController = require('../controllers/solicitacaoController');
const solicitacaoMensagemController = require('../controllers/solicitacaoMensagemController');

const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', solicitacaoController.listar);

router.get('/:id', solicitacaoController.buscarPorId);

router.post('/', solicitacaoController.criar);

router.put('/:id', solicitacaoController.atualizar);

router.delete('/:id', solicitacaoController.remover);

router.get('/:id/mensagens', solicitacaoMensagemController.listar);

router.post('/:id/mensagens', solicitacaoMensagemController.criar);

module.exports = router;