const express = require('express');

const router = express.Router();

const kitnetController = require('../controllers/kitnetController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { exigirConfirmacaoTerminoAntecipado } = permissaoMiddleware;
const prisma = require('../config/prisma');

router.use(authMiddleware);

// Excluir a kitnet -- se tiver um contrato ATIVO nela e o dataFim
// ainda não chegou, é quebra de contrato e vira um encerrar de verdade
// (libera a kitnet, não apaga ela) em vez da exclusão (ver
// permissaoMiddleware.exigirConfirmacaoTerminoAntecipado). Sem
// contrato ativo (já livre), exclui a kitnet normalmente.
const obterContratoDaKitnet = async (req) => {
  return prisma.contrato.findFirst({
    where: { kitnetId: req.params.id, status: 'ATIVO' },
    select: { id: true, dataFim: true },
  });
};

router.get('/', permissaoMiddleware('kitnets.visualizar'), kitnetController.listar);

router.post('/', permissaoMiddleware('kitnets.criar'), kitnetController.criar);

router.put('/:id', permissaoMiddleware('kitnets.editar'), kitnetController.atualizar);

router.delete(
  '/:id',
  permissaoMiddleware('kitnets.excluir'),
  exigirConfirmacaoTerminoAntecipado(obterContratoDaKitnet),
  kitnetController.remover
);

module.exports = router;