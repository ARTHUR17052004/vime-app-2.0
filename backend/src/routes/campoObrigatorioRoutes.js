const express = require('express');
const router = express.Router();

const campoObrigatorioController = require('../controllers/campoObrigatorioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/:modulo', campoObrigatorioController.listar);
router.put('/:modulo', campoObrigatorioController.salvar);

module.exports = router;
