const prisma = require('../config/prisma');
const campoObrigatorioService = require('./campoObrigatorioService');

const sanitizar = (dados) => {

  if (dados.kitnets !== undefined && dados.kitnets !== "") {
    dados.kitnets = parseInt(dados.kitnets, 10) || 0;
  }

  if (dados.aluguel !== undefined && dados.aluguel !== "") {
    dados.aluguel = Number(dados.aluguel);
  } else {
    dados.aluguel = null;
  }

  if (dados.vencimento !== undefined && dados.vencimento !== "") {
    dados.vencimento = parseInt(dados.vencimento, 10);
  } else {
    dados.vencimento = null;
  }

  // Select sem locador escolhido manda "" -- isso não é null nem um id
  // válido, então a Prisma tenta usar "" como foreign key e quebra com
  // "Foreign key constraint violated".
  if (dados.locadorId === "") {
    dados.locadorId = null;
  }

  if (dados.dataInicioCobranca !== undefined) {
    dados.dataInicioCobranca = dados.dataInicioCobranca
      ? new Date(dados.dataInicioCobranca)
      : null;
  }

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.locadorRel;
  delete dados.contratos;
  delete dados.kitnetsRelacionadas;

  return dados;

};

const listar = () => {
  return prisma.unidade.findMany({
    include: {
      locadorRel: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.unidade.findUnique({
    where: { id },
    include: {
      locadorRel: true
    }
  });
};

const criar = async (dados) => {

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('residencia', dados);

  const unidade = await prisma.unidade.create({
    data: dados
  });

  // Gera as kitnets automaticamente na quantidade informada no
  // cadastro da residência -- evita ter que criar uma por uma depois.
  const quantidade = unidade.kitnets || 0;

  if (quantidade > 0) {

    const kitnets = Array.from({ length: quantidade }, (_, i) => ({
      numero: String(i + 1).padStart(2, '0'),
      metragem: 20,
      aluguel: unidade.aluguel || 0,
      unidadeId: unidade.id,
    }));

    await prisma.kitnet.createMany({ data: kitnets });

  }

  return unidade;

};

const atualizar = async (id, dados) => {

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('residencia', dados);

  return prisma.unidade.update({
    where: { id },
    data: dados
  });
};

const remover = (id) => {
  return prisma.unidade.delete({
    where: { id }
  });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
