const express = require('express');

const router = express.Router();

const contratoController = require('../controllers/contratoController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { temPermissao } = permissaoMiddleware;

router.use(authMiddleware);

// Contrato (assinado pela Clicksign) e Arquivo de Contratos (cadastrado na
// mão, já existia em papel) são o mesmo model/tabela por baixo -- pra dar
// pra liberar um sem liberar o outro, toda rota compartilhada aceita
// qualquer uma das duas permissões, nunca só "contratos.*".
const podeContrato = (acao) => async (req, res, next) => {

  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const permitido =
    (await temPermissao(req.usuario, `contratos.${acao}`)) ||
    (await temPermissao(req.usuario, `arquivoContratos.${acao}`));

  if (!permitido) {
    return res.status(403).json({ success: false, message: 'Você não tem permissão para realizar esta ação.' });
  }

  return next();

};

// Anexar o arquivo acontece tanto na hora de criar (quem tem só
// "criar" já precisa anexar o arquivo ali mesmo, no fluxo de "Adicionar
// Contrato") quanto depois, editando -- então aceita qualquer uma das
// duas ações, não só "editar", além das duas permissões acima.
const podeAnexarArquivo = async (req, res, next) => {

  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const chaves = ['contratos.criar', 'contratos.editar', 'arquivoContratos.criar', 'arquivoContratos.editar'];
  const resultados = await Promise.all(chaves.map((chave) => temPermissao(req.usuario, chave)));

  if (!resultados.some(Boolean)) {
    return res.status(403).json({ success: false, message: 'Você não tem permissão para realizar esta ação.' });
  }

  return next();

};

router.get('/', podeContrato('visualizar'), contratoController.listar);

router.get('/:id', podeContrato('visualizar'), contratoController.buscarPorId);

router.get('/:id/pdf', podeContrato('visualizar'), contratoController.baixarPdf);

// Arquivo do contrato "Adicionar Contrato" (upload/download/remoção do
// PDF/scan real -- diferente do /pdf acima, que é o template gerado pelo VIME).
router.get('/:id/arquivo', podeContrato('visualizar'), contratoController.baixarArquivo);
router.post('/:id/arquivo', podeAnexarArquivo, contratoController.uploadArquivo);
router.delete('/:id/arquivo', podeContrato('editar'), contratoController.removerArquivo);

router.post('/', podeContrato('criar'), contratoController.criar);

router.put('/:id', podeContrato('editar'), contratoController.atualizar);

router.delete('/:id', podeContrato('excluir'), contratoController.remover);

router.patch('/:id/encerrar', podeContrato('editar'), contratoController.encerrar);

router.patch('/:id/renovar', podeContrato('editar'), contratoController.renovar);

// Envio pra assinatura é ação do próprio Contrato (finaliza o
// documento), não do módulo "Clicksign" (que cobre a área de
// integração/documentos avulsos) -- fica sob a permissão de Contratos.
router.post('/:id/enviar-clicksign', permissaoMiddleware('contratos.editar'), contratoController.enviarClicksign);

module.exports = router;