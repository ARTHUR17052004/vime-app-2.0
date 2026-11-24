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

// Histórico de missões (aba "Realizadas" da própria tela de Vistorias)
// -- precisa vir antes de "/:id" pra não ser lido como um id.
router.get('/arquivo-missoes', permissaoMiddleware('vistorias.visualizar'), vistoriaController.listarMissoesRealizadas);

// Contagem de fotos das vistorias regulares já concluídas (badge da aba
// Realizadas) -- também precisa vir antes de "/:id" pelo mesmo motivo.
router.get('/arquivo-contagem-fotos', permissaoMiddleware('vistorias.visualizar'), vistoriaController.contarFotosConclusao);

router.get('/:id', permissaoMiddleware('vistorias.visualizar'), vistoriaController.buscarPorId);

// Uma foto/vídeo só, servido como arquivo de verdade (não dentro do
// JSON da vistoria) -- usado pela tela de visualização, ver comentário
// em vistoriaService.obterMidiaVistoria. Precisa vir antes de
// "/:id/missoes" só por organização (não conflita, caminhos diferentes).
router.get('/:id/midia/:campo/:indice', permissaoMiddleware('vistorias.visualizar'), vistoriaController.midiaVistoria);

router.get('/:id/missoes', permissaoMiddleware('vistorias.visualizar'), vistoriaController.listarMissoes);

// Uma missão só, com as fotos completas -- buscado sob demanda ao
// abrir o detalhe/edição de um registro (ver comentário em
// vistoriaService.listarMissoesRealizadas).
router.get('/:id/missoes/:missaoId', permissaoMiddleware('vistorias.visualizar'), vistoriaController.buscarMissao);

// Mesma ideia de "/:id/midia" acima, só que pra foto/vídeo de uma
// missão (vistoria "Geral").
router.get('/:id/missoes/:missaoId/midia/:indice', permissaoMiddleware('vistorias.visualizar'), vistoriaController.midiaMissao);

router.post('/:id/missoes/concluir', permissaoMiddleware('vistorias.editar'), vistoriaController.concluirMissoes);

router.post('/:id/cancelar-realizacao', permissaoMiddleware('vistorias.editar'), vistoriaController.cancelarRealizacao);

router.put('/:id/missoes/:missaoId', permissaoMiddleware('vistorias.editar'), vistoriaController.atualizarMissao);

router.delete('/:id/missoes/:missaoId', permissaoMiddleware('vistorias.excluir'), vistoriaController.removerMissao);

router.post('/', permissaoMiddleware('vistorias.criar'), vistoriaController.criar);

router.put('/:id', permissaoMiddleware('vistorias.editar'), vistoriaController.atualizar);

router.delete('/:id', permissaoMiddleware('vistorias.excluir'), vistoriaController.remover);

module.exports = router;