const prisma = require('../config/prisma');

const listar = () => {
  return prisma.contaPagamento.findMany({
    orderBy: { createdAt: 'asc' },
  });
};

const buscarPorId = (id) => {
  return prisma.contaPagamento.findUnique({
    where: { id },
  });
};

const criar = async (dados) => {

  if (!dados.provider) {
    throw new Error('Escolha o banco/provedor da conta.');
  }

  if (!dados.nome) {
    throw new Error('Dê um nome pra essa conta.');
  }

  // Só uma conta padrão por vez -- vira a substituta de qualquer
  // padrão anterior.
  if (dados.padrao) {
    await prisma.contaPagamento.updateMany({
      where: { padrao: true },
      data: { padrao: false },
    });
  }

  return prisma.contaPagamento.create({
    data: {
      provider: dados.provider,
      nome: dados.nome,
      credenciais: dados.credenciais || {},
      padrao: dados.padrao === true,
      ativo: dados.ativo !== false,
    },
  });

};

const atualizar = async (id, dados) => {

  if (dados.padrao) {
    await prisma.contaPagamento.updateMany({
      where: { padrao: true, NOT: { id } },
      data: { padrao: false },
    });
  }

  return prisma.contaPagamento.update({
    where: { id },
    data: {
      nome: dados.nome,
      credenciais: dados.credenciais,
      padrao: dados.padrao,
      ativo: dados.ativo,
    },
  });

};

const remover = async (id) => {

  const emUso = await prisma.locador.count({ where: { contaPagamentoId: id } });

  if (emUso > 0) {
    throw new Error(
      `Não é possível excluir: ${emUso} locador(es) ainda usam essa conta. Troque a conta deles primeiro.`
    );
  }

  return prisma.contaPagamento.delete({ where: { id } });

};

// Qual conta processa a cobrança de um locador -- a dele mesmo, se
// tiver escolhido; senão a conta padrão do sistema.
const resolverParaLocador = async (locadorId) => {

  if (locadorId) {

    const locador = await prisma.locador.findUnique({
      where: { id: locadorId },
      include: { contaPagamento: true },
    });

    if (locador?.contaPagamento?.ativo) {
      return locador.contaPagamento;
    }

  }

  return prisma.contaPagamento.findFirst({
    where: { padrao: true, ativo: true },
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  resolverParaLocador,
};
