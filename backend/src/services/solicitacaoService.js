const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const notificacaoService = require('./notificacaoService');
const campoObrigatorioService = require('./campoObrigatorioService');

const listar = () => {
  return prisma.solicitacao.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.solicitacao.findUnique({
    where: { id }
  });
};

const criar = async (dados, autor) => {

  await campoObrigatorioService.validar('solicitacao', dados);

  dados.data = new Date();

  if (dados.prazo) dados.prazo = new Date(dados.prazo);

  delete dados.responsavel;
  delete dados.anexo;

  dados.criadoPorId = autor?.id || null;
  dados.criadoPorNome = autor?.nome || "Sistema";
  dados.criadoPorPerfil = autor?.perfil || null;

  const solicitacao = await prisma.solicitacao.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: solicitacao
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    acao: "CRIAR",
    descricao: `Solicitação ${solicitacao.id} criada.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Nova solicitação",
    mensagem: `${solicitacao.criadoPorNome || "Alguém"} criou a solicitação "${solicitacao.titulo}" (${solicitacao.numero}).`,
    link: `/solicitacoes/${solicitacao.id}`
  });

  return solicitacao;

};

const atualizar = async (id, dados) => {

  await campoObrigatorioService.validar('solicitacao', dados);

  if (dados.data) dados.data = new Date(dados.data);
  if (dados.prazo) dados.prazo = new Date(dados.prazo);

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.historico;
  delete dados.mensagens;
  delete dados.criadoPorId;
  delete dados.criadoPorNome;
  delete dados.criadoPorPerfil;
  delete dados.anexo;

  const anterior = await prisma.solicitacao.findUnique({
    where: { id }
  });

  const solicitacao = await prisma.solicitacao.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: solicitacao
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    acao: "ATUALIZAR",
    descricao: `Solicitação ${solicitacao.id} atualizada.`
  });

  return solicitacao;

};

const remover = async (id) => {

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id }
  });

  if (!solicitacao) {
    throw new Error("Solicitação não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "EXCLUIR",
    valorAnterior: solicitacao,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "SOLICITACOES",
    acao: "EXCLUIR",
    descricao: `Solicitação ${solicitacao.id} excluída.`
  });

  return prisma.solicitacao.delete({
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