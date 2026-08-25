const express = require('express');

const router = express.Router();

const signatarioFixoController = require('../controllers/signatarioFixoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', signatarioFixoController.listar);
router.post('/', signatarioFixoController.criar);
router.put('/:id', signatarioFixoController.atualizar);
router.delete('/:id', signatarioFixoController.excluir);

module.exports = router;
