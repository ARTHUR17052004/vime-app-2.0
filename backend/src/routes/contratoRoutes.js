const express = require('express');

const router = express.Router();

const contratoController = require('../controllers/contratoController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('contratos.visualizar'), contratoController.listar);

router.get('/:id', permissaoMiddleware('contratos.visualizar'), contratoController.buscarPorId);

router.get('/:id/pdf', permissaoMiddleware('contratos.visualizar'), contratoController.baixarPdf);

router.post('/', permissaoMiddleware('contratos.criar'), contratoController.criar);

router.put('/:id', permissaoMiddleware('contratos.editar'), contratoController.atualizar);

router.delete('/:id', permissaoMiddleware('contratos.excluir'), contratoController.remover);

router.patch('/:id/encerrar', permissaoMiddleware('contratos.editar'), contratoController.encerrar);

router.patch('/:id/renovar', permissaoMiddleware('contratos.editar'), contratoController.renovar);

// Envio pra assinatura é ação do próprio Contrato (finaliza o
// documento), não do módulo "Clicksign" (que cobre a área de
// integração/documentos avulsos) -- fica sob a permissão de Contratos.
router.post('/:id/enviar-clicksign', permissaoMiddleware('contratos.editar'), contratoController.enviarClicksign);

module.exports = router;