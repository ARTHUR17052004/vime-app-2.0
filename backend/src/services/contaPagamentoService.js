const prisma = require('../config/prisma');
const EFIApi = require('./EFIApi');

const listar = () => {
  return prisma.contaPagamento.findMany({
    include: {
      locadores: { select: { id: true, nome: true } },
    },
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
      taxaBoletoPercentual: paraTaxaOuZero(dados.taxaBoletoPercentual),
      padrao: dados.padrao === true,
      ativo: dados.ativo !== false,
    },
  });

};

function paraTaxaOuZero(valor) {
  if (valor === undefined || valor === null || valor === "") return 0;
  const numero = Number(String(valor).replace(",", "."));
  return Number.isNaN(numero) ? 0 : numero;
}

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
      taxaBoletoPercentual: paraTaxaOuZero(dados.taxaBoletoPercentual),
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

// Extrato Pix recebido no mês -- só faz sentido pra conta EFI (único
// banco com esse endpoint implementado até agora). `mes` no formato
// "AAAA-MM"; sem informar, usa o mês atual.
const extratoPixDoMes = async (id, mes) => {

  const conta = await buscarPorId(id);

  if (!conta) {
    throw new Error('Conta não encontrada.');
  }

  if (conta.provider !== 'EFI') {
    throw new Error('Extrato Pix só está disponível pra contas do banco Efí.');
  }

  const [ano, mesNumero] = (mes || new Date().toISOString().slice(0, 7)).split('-').map(Number);

  const inicio = new Date(Date.UTC(ano, mesNumero - 1, 1, 0, 0, 0));
  const fim = new Date(Date.UTC(ano, mesNumero, 0, 23, 59, 59, 999));

  const extrato = await EFIApi.listarPixRecebidos(
    { dataInicio: inicio.toISOString(), dataFim: fim.toISOString() },
    conta.credenciais
  );

  return { ...extrato, mes: `${ano}-${String(mesNumero).padStart(2, '0')}` };

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  resolverParaLocador,
  extratoPixDoMes,
};
