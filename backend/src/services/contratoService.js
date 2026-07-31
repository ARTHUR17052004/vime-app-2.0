const prisma = require('../config/prisma');

const ClicksignApi = require("./ClicksignApi");
const logService = require("./logService");
const auditoriaService = require("./auditoriaService");
const AsaasApi = require("./AsaasApi");
const WhatsappService = require("./WhatsappService");

const listar = () => {
  return prisma.contrato.findMany({
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true,
      receitas: true
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
      inquilino: true,
      receitas: true
    }
  });
};

const criar = async (dados) => {

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

  const contratoAtivo = await prisma.contrato.findFirst({
    where: {
      inquilinoId: dados.inquilinoId,
      status: "ATIVO"
    }
  });

  const contratoKitnet = await prisma.contrato.findFirst({
    where: {
      kitnetId: dados.kitnetId,
      status: "ATIVO"
    }
  });

  if (contratoKitnet) {
    throw new Error(
      "Esta kitnet já possui um contrato ativo."
    );
  }

  const contratoUnidade = await prisma.contrato.findFirst({
    where: {
      unidadeId: dados.unidadeId,
      kitnetId: dados.kitnetId,
      status: "ATIVO"
    }
  });

  if (
    contratoUnidade &&
    contratoUnidade.id !== contratoKitnet?.id
  ) {
    throw new Error(
      "Já existe um contrato ativo para esta unidade/kitnet."
    );
  }

  if (contratoAtivo) {
    throw new Error(
      "Este inquilino já possui um contrato ativo."
    );
  }

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

  if (kitnet.ocupada) {
    throw new Error(
      'Esta kitnet já possui um contrato ativo.'
    );
  }

  if (dados.valorAluguel <= 0) {
    throw new Error(
      'Valor do aluguel inválido.'
    );
  }

  if (
    dados.diaVencimento < 1 ||
    dados.diaVencimento > 31
  ) {
    throw new Error(
      'Dia de vencimento inválido.'
    );
  }

  if (
    dados.dataFim &&
    new Date(dados.dataFim) <= new Date(dados.dataInicio)
  ) {
    throw new Error(
      'A data final deve ser maior que a data inicial.'
    );
  }

  const contrato = await prisma.contrato.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: contrato
  });

  await ClicksignApi.criarDocumento({
    contratoId: contrato.id,
    nome: `Contrato ${contrato.id}`,
    arquivo: "contrato.pdf"
  });

  await ClicksignApi.enviarAssinatura(
    contrato.id,
    {
      email: inquilino.email
    }
  );

  await AsaasApi.criarCliente({
    name: inquilino.nome,
    email: inquilino.email,
    cpfCnpj: inquilino.cpf,
    phone: inquilino.telefone
  });

  await AsaasApi.criarCobranca({
    customer: inquilino.cpf,
    billingType: "BOLETO",
    value: contrato.valorAluguel,
    dueDate: contrato.dataInicio
  });

  await WhatsappService.enviarMensagem({
    telefone: inquilino.telefone,
    mensagem: `Olá ${inquilino.nome}, seu contrato foi criado com sucesso e enviado para assinatura.`
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CLICKSIGN",
    acao: "CRIAR_DOCUMENTO",
    descricao: `Documento do contrato ${contrato.id} enviado.`
  });

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

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  await prisma.inquilino.update({
    where: {
      id: dados.inquilinoId
    },
    data: {
      status: "ATIVO"
    }
  });

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

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  const contrato = await prisma.contrato.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: contrato
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

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "EXCLUIR",
    valorAnterior: contrato,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "EXCLUIR",
    descricao: `Contrato ${contrato.id} excluído.`
  });

  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: "DISPONIVEL"
    }
  });

  await prisma.inquilino.update({
    where: {
      id: contrato.inquilinoId
    },
    data: {
      status: "INATIVO"
    }
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

  await prisma.inquilino.update({
    where: {
      id: contrato.inquilinoId
    },
    data: {
      status: "INATIVO"
    }
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "ENCERRAR",
    valorAnterior: contrato,
    valorNovo: contratoEncerrado
  });

  await prisma.receita.updateMany({
    where: {
      contratoId: contrato.id,
      status: "PENDENTE",
      vencimento: {
        gt: new Date()
      }
    },
    data: {
      status: "CANCELADA"
    }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ENCERRAR",
    descricao: `Contrato ${contrato.id} encerrado.`
  });

  await WhatsappService.enviarMensagem({
    telefone: contrato.inquilino?.telefone,
    mensagem: "Seu contrato foi encerrado."
  });

  return contratoEncerrado;

};

const inadimplente = async (id) => {

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  const contrato = await prisma.contrato.update({
    where: { id },
    data: {
      status: 'INADIMPLENTE'
    }
  });

  await prisma.receita.updateMany({
    where: {
      contratoId: contrato.id,
      status: "PENDENTE"
    },
    data: {
      status: "ATRASADA"
    }
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "INADIMPLENTE",
    valorAnterior: anterior,
    valorNovo: contrato
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "INADIMPLENTE",
    descricao: `Contrato ${contrato.id} marcado como inadimplente.`
  });

  await WhatsappService.enviarMensagem({
    telefone: contrato.inquilino?.telefone,
    mensagem: "Identificamos um débito em aberto. Entre em contato com a administração."
  });

  return contrato;

};

const renovar = async (id, dados) => {

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  const contrato = await prisma.contrato.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "RENOVAR",
    valorAnterior: anterior,
    valorNovo: contrato
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "RENOVAR",
    descricao: `Contrato ${contrato.id} renovado.`
  });

  return contrato;

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