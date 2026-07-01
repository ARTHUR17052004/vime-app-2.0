const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Todas as rotas do Dashboard exigem autenticação
router.use(authMiddleware);

router.get('/', dashboardController.resumo);

router.get('/atividades', dashboardController.atividades);

router.get('/alertas', dashboardController.alertas);

router.get('/ocupacao', dashboardController.ocupacao);

router.get('/financeiro', dashboardController.financeiro);

module.exports = router;