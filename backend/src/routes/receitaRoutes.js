const express = require('express');

const router = express.Router();

const receitaController = require('../controllers/receitaController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { exigirPermissaoParaMarcarPago, exigirConfirmacaoEdicaoValor, exigirConfirmacaoExclusao } = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('financeiro.visualizar'), receitaController.listar);

router.get('/taxa-boleto', permissaoMiddleware('financeiro.visualizar'), receitaController.taxaBoleto);

router.get('/:id', permissaoMiddleware('financeiro.visualizar'), receitaController.buscarPorId);

router.post('/', permissaoMiddleware('financeiro.editar'), exigirPermissaoParaMarcarPago, receitaController.criar);

router.put('/:id', permissaoMiddleware('financeiro.editar'), exigirPermissaoParaMarcarPago, exigirConfirmacaoEdicaoValor, receitaController.atualizar);

router.delete('/:id', permissaoMiddleware('financeiro.editar'), exigirConfirmacaoExclusao, receitaController.remover);

module.exports = router;