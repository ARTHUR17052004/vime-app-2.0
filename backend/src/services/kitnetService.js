const prisma = require('../config/prisma');
const campoObrigatorioService = require('./campoObrigatorioService');
const { filtroKitnet } = require('../utils/escopoLocador');
const { gerarVistoriaDeEntrega } = require('../utils/kitnetOcupacao');

const listar = (usuario) => {
  return prisma.kitnet.findMany({
    where: filtroKitnet(usuario),
    include: {
      unidade: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.kitnet.findUnique({
    where: { id },
    include: {
      unidade: true
    }
  });
};

const criar = async (dados, usuario) => {

  await campoObrigatorioService.validar('kitnet', dados);

  const unidade = await prisma.unidade.findUnique({
    where: { id: dados.unidadeId }
  });

  if (!unidade) {
    throw new Error('Residência não encontrada.');
  }

  if (usuario?.locadorId && unidade.locadorId !== usuario.locadorId) {
    throw new Error('Residência não encontrada.');
  }

  // unidade.kitnets é o limite cadastrado pra essa residência -- sem
  // limite definido (null/0), não há teto a aplicar aqui.
  if (unidade.kitnets) {

    const existentes = await prisma.kitnet.count({
      where: { unidadeId: dados.unidadeId }
    });

    if (existentes >= unidade.kitnets) {
      throw new Error(
        `Não é possível criar uma kitnet fora do limite da residência: "${unidade.nome}" já tem ${existentes} de ${unidade.kitnets} kitnet(s) cadastradas. Para adicionar mais, aumente a "Quantidade de Kitnets" em Residências.`
      );
    }

  }

  const kitnet = await prisma.kitnet.create({
    // Criada manualmente aqui (fora do lote automático da Residência)
    // -- o valor já veio escolhido pelo usuário, então não deixa a
    // edição da Residência sobrescrever depois.
    data: { ...dados, aluguelManual: true }
  });

  // Já nasce vazia (status padrão é DISPONIVEL) -- mesmo gatilho de
  // vistoria automática das que ficaram vazias depois de ocupadas.
  if (kitnet.status === 'DISPONIVEL') {
    gerarVistoriaDeEntrega(kitnet.id);
  }

  return kitnet;

};

const atualizar = async (id, dados) => {

  const atual = await prisma.kitnet.findUnique({ where: { id } });

  // Atualização parcial (ex.: só o status) não pode reprovar por
  // "faltar" um campo que já está preenchido desde a criação -- valida
  // o resultado final (atual + alterações), não só o pedaço enviado.
  await campoObrigatorioService.validar('kitnet', { ...atual, ...dados });

  // Só marca como "editada manualmente" se o aluguel realmente mudou --
  // assim um salvar sem mexer nesse campo não trava a sincronização
  // automática vinda da Residência.
  if (
    atual &&
    dados.aluguel !== undefined &&
    Number(dados.aluguel) !== atual.aluguel
  ) {
    dados.aluguelManual = true;
  }

  // "ocupada" e "status" representam a mesma coisa, mas quando o
  // status é trocado direto aqui (fora do fluxo de contrato/inquilino),
  // só ele era atualizado -- "ocupada" ficava para trás. Mantém os dois
  // batendo sempre que o status muda nessa tela.
  if (dados.status !== undefined) {
    dados.ocupada = dados.status === 'OCUPADA';
  }

  const resultado = await prisma.kitnet.update({
    where: { id },
    data: dados
  });

  // Ficou vazia agora mesmo (editada direto nesta tela, não por um
  // contrato/inquilino) -- mesmo gatilho de vistoria automática.
  if (dados.status === 'DISPONIVEL' && atual?.status !== 'DISPONIVEL') {
    gerarVistoriaDeEntrega(id);
  }

  return resultado;
};

const remover = (id) => {
  return prisma.kitnet.delete({
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