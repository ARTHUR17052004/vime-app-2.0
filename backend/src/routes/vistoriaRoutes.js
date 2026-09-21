const express = require('express');

const router = express.Router();

const vistoriaController = require('../controllers/vistoriaController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const escopoRegistro = require('../middlewares/escopoRegistro');
const { filtroVistoria } = require('../utils/escopoLocador');

router.use(authMiddleware);

// Restrito a um locador: só mexe em vistoria da própria área, mesmo pelo id.
router.param('id', escopoRegistro('vistoria', filtroVistoria));

router.get('/', permissaoMiddleware('vistorias.visualizar'), vistoriaController.listar);

router.get('/:id', permissaoMiddleware('vistorias.visualizar'), vistoriaController.buscarPorId);

router.post('/', permissaoMiddleware('vistorias.criar'), vistoriaController.criar);

router.put('/:id', permissaoMiddleware('vistorias.editar'), vistoriaController.atualizar);

router.delete('/:id', permissaoMiddleware('vistorias.excluir'), vistoriaController.remover);

module.exports = router;