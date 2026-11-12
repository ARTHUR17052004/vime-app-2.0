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
// contrato (ver permissaoMiddleware.exigirConfirmacaoTerminoAntecipado).
const obterDataFimDoInquilino = async (req) => {
  const contrato = await prisma.contrato.findFirst({
    where: { inquilinoId: req.params.id, status: 'ATIVO' },
    select: { dataFim: true },
  });
  return contrato?.dataFim || null;
};

const obterContextoDoInquilino = async (req) => {
  const inquilino = await prisma.inquilino.findUnique({
    where: { id: req.params.id },
    select: { nome: true },
  });
  return inquilino?.nome ? `inquilino ${inquilino.nome} excluído` : null;
};

router.get('/', permissaoMiddleware('inquilinos.visualizar'), inquilinoController.listar);

router.get('/:id', permissaoMiddleware('inquilinos.visualizar'), inquilinoController.buscarPorId);

router.post('/', permissaoMiddleware('inquilinos.criar'), inquilinoController.criar);

router.put('/:id', permissaoMiddleware('inquilinos.editar'), inquilinoController.atualizar);

router.delete(
  '/:id',
  permissaoMiddleware('inquilinos.excluir'),
  exigirConfirmacaoTerminoAntecipado(obterDataFimDoInquilino, obterContextoDoInquilino),
  inquilinoController.remover
);

module.exports = router;