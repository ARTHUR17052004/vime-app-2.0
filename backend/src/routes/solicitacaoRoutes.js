const express = require('express');

const router = express.Router();

const solicitacaoController = require('../controllers/solicitacaoController');

const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', solicitacaoController.listar);

router.get('/:id', solicitacaoController.buscarPorId);

router.post('/', solicitacaoController.criar);

router.put('/:id', solicitacaoController.atualizar);

router.delete('/:id', solicitacaoController.remover);

module.exports = router;