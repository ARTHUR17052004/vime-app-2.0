const express = require('express');

const router = express.Router();

const solicitacaoController = require('../controllers/solicitacaoController');
const solicitacaoMensagemController = require('../controllers/solicitacaoMensagemController');

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('solicitacoes.visualizar'), solicitacaoController.listar);

router.get('/:id', permissaoMiddleware('solicitacoes.visualizar'), solicitacaoController.buscarPorId);

router.post('/', permissaoMiddleware('solicitacoes.criar'), solicitacaoController.criar);

router.put('/:id', permissaoMiddleware('solicitacoes.editar'), solicitacaoController.atualizar);

router.delete('/:id', permissaoMiddleware('solicitacoes.excluir'), solicitacaoController.remover);

router.get('/:id/mensagens', permissaoMiddleware('solicitacoes.visualizar'), solicitacaoMensagemController.listar);

// A permissão de "classificar" (mudar status via mensagem) já é
// conferida dentro do controller -- aqui só exige poder ver/participar
// da solicitação pra mandar qualquer mensagem.
router.post('/:id/mensagens', permissaoMiddleware('solicitacoes.visualizar'), solicitacaoMensagemController.criar);

module.exports = router;