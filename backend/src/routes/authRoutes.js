const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post('/esqueci-senha', authController.esqueciSenha);

router.post('/redefinir-senha', authController.redefinirSenha);

router.get('/me', authMiddleware, authController.me);

router.put('/me', authMiddleware, authController.atualizarMe);

module.exports = router;