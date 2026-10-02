const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Todas as rotas do Dashboard exigem autenticação
router.use(authMiddleware);

// Cada pedaço da tela inicial tem a sua própria permissão (ver
// Administração > Permissões > Dashboard) -- um perfil pode ver a tela
// mas não um gráfico específico, por exemplo.
router.get('/', permissaoMiddleware('dashboard.indicadores'), dashboardController.resumo);

router.get('/atividades', permissaoMiddleware('dashboard.atividades'), dashboardController.atividades);

router.get('/alertas', permissaoMiddleware('dashboard.alertas'), dashboardController.alertas);

router.get('/ocupacao', permissaoMiddleware('dashboard.ocupacao'), dashboardController.ocupacao);

router.get('/financeiro', permissaoMiddleware('dashboard.financeiro'), dashboardController.financeiro);

router.get('/receitas-mensais', permissaoMiddleware('dashboard.financeiro'), dashboardController.receitasMensais);

module.exports = router;