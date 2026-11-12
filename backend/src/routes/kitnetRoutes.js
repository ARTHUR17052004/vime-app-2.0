const express = require('express');

const router = express.Router();

const kitnetController = require('../controllers/kitnetController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');
const { exigirConfirmacaoTerminoAntecipado } = permissaoMiddleware;
const prisma = require('../config/prisma');

router.use(authMiddleware);

// Excluir a kitnet esvazia ela de vez -- se tiver um contrato ATIVO
// nela e o dataFim ainda não chegou, é quebra de contrato (ver
// permissaoMiddleware.exigirConfirmacaoTerminoAntecipado).
const obterDataFimDaKitnet = async (req) => {
  const contrato = await prisma.contrato.findFirst({
    where: { kitnetId: req.params.id, status: 'ATIVO' },
    select: { dataFim: true },
  });
  return contrato?.dataFim || null;
};

const obterContextoDaKitnet = async (req) => {
  const contrato = await prisma.contrato.findFirst({
    where: { kitnetId: req.params.id, status: 'ATIVO' },
    include: { inquilino: true, kitnet: true },
  });
  if (!contrato) return null;
  const nome = contrato.inquilino?.nome || "inquilino";
  const kitnet = contrato.kitnet?.nome || contrato.kitnet?.numero || "?";
  return `kitnet ${kitnet} excluída (${nome})`;
};

router.get('/', permissaoMiddleware('kitnets.visualizar'), kitnetController.listar);

router.post('/', permissaoMiddleware('kitnets.criar'), kitnetController.criar);

router.put('/:id', permissaoMiddleware('kitnets.editar'), kitnetController.atualizar);

router.delete(
  '/:id',
  permissaoMiddleware('kitnets.excluir'),
  exigirConfirmacaoTerminoAntecipado(obterDataFimDaKitnet, obterContextoDaKitnet),
  kitnetController.remover
);

module.exports = router;