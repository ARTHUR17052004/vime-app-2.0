const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const biometriaController = require('../controllers/biometriaController');

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post('/esqueci-senha', authController.esqueciSenha);

router.post('/redefinir-senha', authController.redefinirSenha);

router.get('/me', authMiddleware, authController.me);

router.put('/me', authMiddleware, authController.atualizarMe);

// Login por digital/rosto (WebAuthn). As de login são públicas; o cadastro e
// o gerenciamento exigem o usuário logado.
router.post('/biometria/login/opcoes', biometriaController.opcoesDeLogin);
router.post('/biometria/login/verificar', biometriaController.verificarLogin);
router.post('/biometria/registro/opcoes', authMiddleware, biometriaController.opcoesDeRegistro);
router.post('/biometria/registro/verificar', authMiddleware, biometriaController.verificarRegistro);
router.get('/biometria', authMiddleware, biometriaController.listar);
router.delete('/biometria/:id', authMiddleware, biometriaController.remover);

module.exports = router;