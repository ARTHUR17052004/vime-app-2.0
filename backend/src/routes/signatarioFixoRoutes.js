const express = require('express');

const router = express.Router();

const signatarioFixoController = require('../controllers/signatarioFixoController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

router.use(authMiddleware);

router.get('/', permissaoMiddleware('clicksign.signatariosFixos'), signatarioFixoController.listar);
router.post('/', permissaoMiddleware('clicksign.signatariosFixos'), signatarioFixoController.criar);
router.put('/:id', permissaoMiddleware('clicksign.signatariosFixos'), signatarioFixoController.atualizar);
router.delete('/:id', permissaoMiddleware('clicksign.signatariosFixos'), signatarioFixoController.excluir);

module.exports = router;
