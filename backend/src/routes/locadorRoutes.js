const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');

const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

const router = express.Router();

const locadorController = require('../controllers/locadorController');

// Antes travado em "só ADMINISTRADOR" (perfilMiddleware) -- isso
// ignorava por completo o que a tela de Permissões configurava pra
// Locadores (ex.: perfis com locadores.* marcado continuavam
// bloqueados). Passa a respeitar de verdade a permissão granular.
router.get('/', authMiddleware, permissaoMiddleware('locadores.visualizar'), locadorController.listar);

router.post('/', authMiddleware, permissaoMiddleware('locadores.criar'), locadorController.criar);

router.put('/:id', authMiddleware, permissaoMiddleware('locadores.editar'), locadorController.atualizar);

router.delete('/:id', authMiddleware, permissaoMiddleware('locadores.excluir'), locadorController.remover);

module.exports = router;