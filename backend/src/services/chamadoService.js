const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const notificacaoService = require('./notificacaoService');

const listar = () => {
  return prisma.chamado.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.chamado.findUnique({
    where: { id }
  });
};

const criar = async (dados, autor) => {

  if (!dados.titulo) {
    throw new Error('Título é obrigatório.');
  }

  delete dados.anexo;

  dados.criadoPorId = autor?.id || null;
  dados.criadoPorNome = autor?.nome || "Sistema";
  dados.criadoPorPerfil = autor?.perfil || null;

  const chamado = await prisma.chamado.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SUPORTE",
    registroId: chamado.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: chamado
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SUPORTE",
    acao: "CRIAR",
    descricao: `Chamado ${chamado.id} aberto.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Novo chamado de suporte",
    mensagem: `${chamado.criadoPorNome || "Alguém"} abriu o chamado "${chamado.titulo}" (${chamado.numero}).`,
    link: `/suporte/${chamado.id}`
  });

  return chamado;

};

const atualizar = async (id, dados) => {

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.mensagens;
  delete dados.criadoPorId;
  delete dados.criadoPorNome;
  delete dados.criadoPorPerfil;
  delete dados.anexo;

  const anterior = await prisma.chamado.findUnique({
    where: { id }
  });

  const chamado = await prisma.chamado.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SUPORTE",
    registroId: chamado.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: chamado
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SUPORTE",
    acao: "ATUALIZAR",
    descricao: `Chamado ${chamado.id} atualizado.`
  });

  return chamado;

};

const remover = async (id) => {

  const chamado = await prisma.chamado.findUnique({
    where: { id }
  });

  if (!chamado) {
    throw new Error("Chamado não encontrado.");
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SUPORTE",
    registroId: chamado.id,
    acao: "EXCLUIR",
    valorAnterior: chamado,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SUPORTE",
    acao: "EXCLUIR",
    descricao: `Chamado ${chamado.id} excluído.`
  });

  return prisma.chamado.delete({
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
