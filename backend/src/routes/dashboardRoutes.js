const express = require('express');

const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.resumo);

router.get('/atividades', dashboardController.atividades);

router.get('/alertas', dashboardController.alertas);

router.get('/ocupacao', dashboardController.ocupacao);

router.get('/financeiro', dashboardController.financeiro);

module.exports = router;