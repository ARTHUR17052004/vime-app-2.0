const express = require('express');

const router = express.Router();

const contratoController = require('../controllers/contratoController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { temPermissao } = permissaoMiddleware;

router.use(authMiddleware);

// Anexar o arquivo acontece tanto na hora de criar (quem tem só
// "contratos.criar" já precisa anexar o arquivo ali mesmo, no fluxo de
// "Adicionar Contrato") quanto depois, editando -- então aceita qualquer
// uma das duas permissões, não só "editar".
const podeAnexarArquivo = async (req, res, next) => {

  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const permitido =
    (await temPermissao(req.usuario, 'contratos.criar')) ||
    (await temPermissao(req.usuario, 'contratos.editar'));

  if (!permitido) {
    return res.status(403).json({ success: false, message: 'Você não tem permissão para realizar esta ação.' });
  }

  return next();

};

router.get('/', permissaoMiddleware('contratos.visualizar'), contratoController.listar);

router.get('/:id', permissaoMiddleware('contratos.visualizar'), contratoController.buscarPorId);

router.get('/:id/pdf', permissaoMiddleware('contratos.visualizar'), contratoController.baixarPdf);

// Arquivo do contrato "Adicionar Contrato" (upload/download/remoção do
// PDF/scan real -- diferente do /pdf acima, que é o template gerado pelo VIME).
router.get('/:id/arquivo', permissaoMiddleware('contratos.visualizar'), contratoController.baixarArquivo);
router.post('/:id/arquivo', podeAnexarArquivo, contratoController.uploadArquivo);
router.delete('/:id/arquivo', permissaoMiddleware('contratos.editar'), contratoController.removerArquivo);

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