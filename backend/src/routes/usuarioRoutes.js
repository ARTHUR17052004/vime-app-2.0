const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const perfilMiddleware = require('../middlewares/perfilMiddleware');

router.get('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.listar);

// Qualquer usuário logado pode ver essa lista (id+nome, só zeladores
// ativos) -- é o que alimenta o seletor de "Responsável" na Vistoria;
// quem cria (Operador, Gerência...) não tem permissão da tela de
// Usuários, mas precisa escolher entre os zeladores.
router.get('/zeladores', authMiddleware, usuarioController.listarZeladores);

router.get('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.buscarPorId);

router.post('/', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.criar);

router.post('/:id/enviar-acesso', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.enviarAcesso);

router.put('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.atualizar);

router.delete('/:id', authMiddleware, perfilMiddleware('ADMINISTRADOR'), usuarioController.remover);

router.post('/:id/redefinir-senha', authMiddleware, usuarioController.redefinirSenha);

module.exports = router;