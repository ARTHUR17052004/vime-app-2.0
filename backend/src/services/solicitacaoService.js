const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const notificacaoService = require('./notificacaoService');
const { filtroSolicitacao } = require('../utils/escopoLocador');
const campoObrigatorioService = require('./campoObrigatorioService');

const listar = (usuario) => {
  return prisma.solicitacao.findMany({
    where: filtroSolicitacao(usuario),
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

  dados.locadorId = autor?.locadorId || null;
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
    mensagem: `🛠️ ${solicitacao.criadoPorNome || "Alguém"} abriu a solicitação "${solicitacao.titulo}" (${solicitacao.numero}). Dá uma olhada quando puder!`,
    link: `/solicitacoes/${solicitacao.id}`,
    locadorId: solicitacao.locadorId
  });

  return solicitacao;

};

const atualizar = async (id, dados) => {

  // Atualização parcial (ex.: só classificar/responder) não pode
  // reprovar por "faltar" um campo que já está preenchido desde a
  // criação -- valida o resultado final (atual + alterações).
  const atual = await prisma.solicitacao.findUnique({ where: { id } });
  await campoObrigatorioService.validar('solicitacao', { ...atual, ...dados });

  if (dados.data) dados.data = new Date(dados.data);
  if (dados.prazo) dados.prazo = new Date(dados.prazo);

  delete dados.locadorId;
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

  const removida = await prisma.solicitacao.delete({
    where: { id }
  });

  // Sem isso, uma notificação antiga (ex.: "Nova solicitação") continua
  // linkando pra um id que não existe mais -- clicar nela cai em
  // "Solicitação não encontrada" em vez de abrir alguma coisa. Nunca
  // pode impedir a exclusão em si.
  try {
    await notificacaoService.removerPorLink(`/solicitacoes/${id}`);
  } catch (erro) {
    console.error('[notificacao] Falha ao limpar notificações da solicitação excluída:', erro.message);
  }

  return removida;

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};