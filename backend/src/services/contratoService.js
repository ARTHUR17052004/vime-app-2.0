const prisma = require('../config/prisma');

const logService = require("./logService");

const listar = () => {
  return prisma.contrato.findMany({
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.contrato.findUnique({
    where: { id },
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true
    }
  });
};

const criar = async (dados) => {

  // Busca os registros necessários
  const kitnet = await prisma.kitnet.findUnique({
    where: {
      id: dados.kitnetId
    }
  });

  const unidade = await prisma.unidade.findUnique({
    where: {
      id: dados.unidadeId
    }
  });

  const locador = await prisma.locador.findUnique({
    where: {
      id: dados.locadorId
    }
  });

  const inquilino = await prisma.inquilino.findUnique({
    where: {
      id: dados.inquilinoId
    }
  });

  // Valida existência

  if (!kitnet) {
    throw new Error('Kitnet não encontrada.');
  }

  if (!unidade) {
    throw new Error('Unidade não encontrada.');
  }

  if (!locador) {
    throw new Error('Locador não encontrado.');
  }

  if (!inquilino) {
    throw new Error('Inquilino não encontrado.');
  }

  // Valida relacionamentos

  if (kitnet.unidadeId !== unidade.id) {
    throw new Error(
      'A kitnet informada não pertence à unidade selecionada.'
    );
  }

  if (unidade.locadorId !== locador.id) {
    throw new Error(
      'A unidade informada não pertence ao locador selecionado.'
    );
  }

  if (inquilino.kitnetId !== kitnet.id) {
    throw new Error(
      'O inquilino informado não pertence à kitnet selecionada.'
    );
  }

  // Impede criar contrato em kitnet ocupada

  if (kitnet.ocupada) {
    throw new Error(
      'Esta kitnet já possui um contrato ativo.'
    );
  }

  // Valida valor do aluguel

  if (dados.valorAluguel <= 0) {
    throw new Error(
      'Valor do aluguel inválido.'
    );
  }

  // Valida vencimento

  if (
    dados.diaVencimento < 1 ||
    dados.diaVencimento > 31
  ) {
    throw new Error(
      'Dia de vencimento inválido.'
    );
  }

  // Valida datas

  if (
    dados.dataFim &&
    new Date(dados.dataFim) <= new Date(dados.dataInicio)
  ) {
    throw new Error(
      'A data final deve ser maior que a data inicial.'
    );
  }

  // Cria contrato

  const contrato = await prisma.contrato.create({
    data: dados
  });

  // Cria primeira receita

  await prisma.receita.create({
    data: {
      contratoId: contrato.id,
      categoria: 'Aluguel',
      descricao: `Aluguel - ${kitnet.numero}`,
      valor: contrato.valorAluguel,
      vencimento: contrato.dataInicio,
      status: 'PENDENTE'
    }
  });

  // Ocupa kitnet

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  // Log

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "CRIAR",
    descricao: `Contrato ${contrato.id} criado.`
  });

  return contrato;

};

const atualizar = async (id, dados) => {

  const contrato = await prisma.contrato.update({
    where: { id },
    data: dados
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ATUALIZAR",
    descricao: `Contrato ${contrato.id} atualizado.`
  });

  return contrato;

};

const remover = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      receitas: true
    }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  if (contrato.receitas.length > 0) {
    throw new Error(
      'Não é possível excluir um contrato que possui receitas vinculadas.'
    );
  }

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "EXCLUIR",
    descricao: `Contrato ${contrato.id} excluído.`
  });

  return prisma.contrato.delete({
    where: { id }
  });

};

const encerrar = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  const contratoEncerrado = await prisma.contrato.update({
    where: { id },
    data: {
      status: 'ENCERRADO',
      dataFim: contrato.dataFim || new Date()
    }
  });

  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: 'DISPONIVEL'
    }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ENCERRAR",
    descricao: `Contrato ${contrato.id} encerrado.`
  });

  return contratoEncerrado;

};

const inadimplente = (id) => {
  return prisma.contrato.update({
    where: { id },
    data: {
      status: 'INADIMPLENTE'
    }
  });
};

const renovar = (id, dados) => {
  return prisma.contrato.update({
    where: { id },
    data: dados
  });
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  encerrar,
  inadimplente,
  renovar
};