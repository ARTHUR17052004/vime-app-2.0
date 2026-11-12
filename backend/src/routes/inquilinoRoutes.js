const express = require('express');

const router = express.Router();

const inquilinoController = require('../controllers/inquilinoController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { exigirConfirmacaoTerminoAntecipado } = permissaoMiddleware;
const prisma = require('../config/prisma');

router.use(authMiddleware);

// Excluir o Inquilino esvazia a kitnet dele (ver inquilinoService.remover) --
// se o contrato ATIVO dele ainda não chegou no dataFim, é quebra de
// contrato e vira um encerrar de verdade em vez da exclusão (ver
// permissaoMiddleware.exigirConfirmacaoTerminoAntecipado).
const obterContratoDoInquilino = async (req) => {
  return prisma.contrato.findFirst({
    where: { inquilinoId: req.params.id, status: 'ATIVO' },
    select: { id: true, dataFim: true },
  });
};

router.get('/', permissaoMiddleware('inquilinos.visualizar'), inquilinoController.listar);

router.get('/:id', permissaoMiddleware('inquilinos.visualizar'), inquilinoController.buscarPorId);

router.post('/', permissaoMiddleware('inquilinos.criar'), inquilinoController.criar);

router.put('/:id', permissaoMiddleware('inquilinos.editar'), inquilinoController.atualizar);

router.delete(
  '/:id',
  permissaoMiddleware('inquilinos.excluir'),
  exigirConfirmacaoTerminoAntecipado(obterContratoDoInquilino),
  inquilinoController.remover
);

module.exports = router;