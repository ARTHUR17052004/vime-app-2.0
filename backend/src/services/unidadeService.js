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

// Depois de editar a residência, mantém as kitnets em sincronia:
// - quantidade menor -> apaga o excedente (só vagas -- nunca uma
//   kitnet ocupada, isso apagaria inquilino/contrato junto)
// - quantidade maior -> cria as que faltam, continuando a numeração
// - aluguel mudou -> propaga pras kitnets que nunca foram editadas
//   manualmente (aluguelManual: false)
const sincronizarKitnets = async (antes, depois) => {

  const kitnets = await prisma.kitnet.findMany({
    where: { unidadeId: depois.id },
    orderBy: { numero: 'asc' },
  });

  const aluguelMudou = (depois.aluguel ?? null) !== (antes.aluguel ?? null);

  if (aluguelMudou) {
    await prisma.kitnet.updateMany({
      where: { unidadeId: depois.id, aluguelManual: false },
      data: { aluguel: depois.aluguel || 0 },
    });
  }

  const alvo = depois.kitnets || 0;
  const diferenca = alvo - kitnets.length;

  if (diferenca > 0) {

    const maiorNumero = kitnets.reduce((max, k) => {
      const n = parseInt(k.numero, 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const novas = Array.from({ length: diferenca }, (_, i) => ({
      numero: String(maiorNumero + i + 1).padStart(2, '0'),
      metragem: 20,
      aluguel: depois.aluguel || 0,
      unidadeId: depois.id,
    }));

    await prisma.kitnet.createMany({ data: novas });

  } else if (diferenca < 0) {

    const aRemover = Math.abs(diferenca);

    const candidatas = kitnets
      .filter((k) => !k.ocupada)
      .sort((a, b) => (parseInt(b.numero, 10) || 0) - (parseInt(a.numero, 10) || 0))
      .slice(0, aRemover);

    if (candidatas.length > 0) {
      await prisma.kitnet.deleteMany({
        where: { id: { in: candidatas.map((k) => k.id) } },
      });
    }

    // Se não tinha vaga suficiente pra apagar (kitnets ocupadas no
    // caminho), o total real fica acima do pedido -- avisa o usuário
    // em vez de falhar a edição inteira.
    if (candidatas.length < aRemover) {
      return `Não foi possível reduzir para ${alvo} kitnet(s): ${
        aRemover - candidatas.length
      } kitnet(s) em excesso está(ão) ocupada(s) e não foi(ram) removida(s). Desocupe-a(s) primeiro.`;
    }

  }

  return null;

};

const atualizar = async (id, dados) => {

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('residencia', dados);

  const antes = await prisma.unidade.findUnique({ where: { id } });

  if (!antes) {
    throw new Error('Residência não encontrada.');
  }

  const unidade = await prisma.unidade.update({
    where: { id },
    data: dados
  });

  const avisoKitnets = await sincronizarKitnets(antes, unidade);

  return avisoKitnets ? { ...unidade, avisoKitnets } : unidade;
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
