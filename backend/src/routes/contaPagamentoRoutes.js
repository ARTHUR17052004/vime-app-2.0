const express = require('express');

const router = express.Router();

const contaPagamentoController = require('../controllers/contaPagamentoController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

// Reaproveita as permissões da tela de config do Asaas -- a tela
// "Contas" é a evolução dela (agora com qualquer banco), não uma área
// nova, então não faz sentido pedir pra reconfigurar permissões de novo.
router.use(authMiddleware);

router.get('/', permissaoMiddleware('asaasConfig.visualizar'), contaPagamentoController.listar);

router.post('/', permissaoMiddleware('asaasConfig.editar'), contaPagamentoController.criar);

router.put('/:id', permissaoMiddleware('asaasConfig.editar'), contaPagamentoController.atualizar);

router.delete('/:id', permissaoMiddleware('asaasConfig.editar'), contaPagamentoController.remover);

module.exports = router;
