const express = require('express');

const router = express.Router();

const vistoriaController = require('../controllers/vistoriaController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { temPermissao } = permissaoMiddleware;
const escopoRegistro = require('../middlewares/escopoRegistro');
const { filtroVistoria } = require('../utils/escopoLocador');

router.use(authMiddleware);

// Restrito a um locador: só mexe em vistoria da própria área, mesmo pelo id.
router.param('id', escopoRegistro('vistoria', filtroVistoria));

// Arquivo de Vistorias Realizadas (histórico de missões) tem tela e
// permissão próprias, mas quem já vê Vistorias (ex.: pela aba
// Relatórios, dentro da própria tela de Vistorias) também precisa
// enxergar -- aceita qualquer uma das duas, igual Contratos/Arquivo de
// Contratos.
const podeVerArquivo = async (req, res, next) => {

  const permitido =
    (await temPermissao(req.usuario, 'vistorias.visualizar')) ||
    (await temPermissao(req.usuario, 'arquivoVistorias.visualizar'));

  if (!permitido) {
    return res.status(403).json({ success: false, message: 'Você não tem permissão para realizar esta ação.' });
  }

  return next();

};

router.get('/', permissaoMiddleware('vistorias.visualizar'), vistoriaController.listar);

// Precisa vir antes de "/:id" pra não ser lido como um id.
router.get('/arquivo-missoes', podeVerArquivo, vistoriaController.listarMissoesRealizadas);

router.get('/:id', permissaoMiddleware('vistorias.visualizar'), vistoriaController.buscarPorId);

router.get('/:id/missoes', permissaoMiddleware('vistorias.visualizar'), vistoriaController.listarMissoes);

router.post('/:id/missoes/concluir', permissaoMiddleware('vistorias.editar'), vistoriaController.concluirMissoes);

router.post('/', permissaoMiddleware('vistorias.criar'), vistoriaController.criar);

router.put('/:id', permissaoMiddleware('vistorias.editar'), vistoriaController.atualizar);

router.delete('/:id', permissaoMiddleware('vistorias.excluir'), vistoriaController.remover);

module.exports = router;