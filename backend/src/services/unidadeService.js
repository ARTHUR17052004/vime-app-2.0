const prisma = require('../config/prisma');
const campoObrigatorioService = require('./campoObrigatorioService');
const { validarCep } = require('../utils/validadores');
const { filtroUnidade } = require('../utils/escopoLocador');

const sanitizar = (dados) => {

  if (dados.cep && !validarCep(dados.cep)) {
    throw new Error('CEP inválido.');
  }

  if (dados.uf) {
    const ufLimpa = String(dados.uf).trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(ufLimpa)) {
      throw new Error('UF inválida: use a sigla de 2 letras (ex.: SP, GO).');
    }

    dados.uf = ufLimpa;
  }

  if (dados.kitnets !== undefined && dados.kitnets !== "") {

    const kitnets = parseInt(dados.kitnets, 10);

    if (!Number.isInteger(kitnets) || kitnets < 1) {
      throw new Error('Quantidade de Kitnets deve ser um número inteiro de pelo menos 1.');
    }

    dados.kitnets = kitnets;

  }

  if (dados.aluguel !== undefined && dados.aluguel !== "") {

    const aluguel = Number(dados.aluguel);

    if (!Number.isFinite(aluguel) || aluguel <= 0) {
      throw new Error('Valor do Aluguel deve ser um número maior que zero.');
    }

    dados.aluguel = aluguel;

  } else {
    dados.aluguel = null;
  }

  if (dados.vencimento !== undefined && dados.vencimento !== "") {

    const vencimento = parseInt(dados.vencimento, 10);

    if (!Number.isInteger(vencimento) || vencimento < 1 || vencimento > 31) {
      throw new Error('Dia de Vencimento deve ser um número entre 1 e 31.');
    }

    dados.vencimento = vencimento;

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

const listar = (usuario) => {
  return prisma.unidade.findMany({
    where: filtroUnidade(usuario),
    include: {
      locadorRel: true
    },
    // Por nome (ex.: "VIME I", "VIME II", "VIME III"...) em vez de data
    // de criação -- fica na ordem que faz sentido pra quem tá olhando
    // a lista, não na ordem em que foram cadastradas.
    orderBy: {
      nome: 'asc'
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

    // "status" (não "ocupada") é o campo que reflete a tela de Kitnets
    // de verdade -- os dois podem ficar dessincronizados quando o
    // status é trocado manualmente, e usar "ocupada" aqui já quase
    // apagou kitnet ocupada de verdade nesta base.
    const candidatas = kitnets
      .filter((k) => k.status !== 'OCUPADA')
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
