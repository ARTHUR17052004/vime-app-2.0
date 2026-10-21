const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const notificacaoService = require('./notificacaoService');
const { diffCampos } = require('../utils/diffCampos');

const CAMPOS_CHAMADO = {
  titulo: 'título',
  categoria: 'categoria',
  criticidade: 'criticidade',
  status: 'status',
  arquivado: 'arquivado',
};

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
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SUPORTE",
    registroId: chamado.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: chamado
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SUPORTE",
    acao: "CRIAR",
    descricao: `Chamado "${chamado.titulo}" (${chamado.numero}) aberto por ${autor?.nome || "Sistema"}.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Novo chamado de suporte",
    mensagem: await notificacaoService.renderizarMensagem(
      'CHAMADO',
      { autor: chamado.criadoPorNome || "Alguém", titulo: chamado.titulo, numero: chamado.numero, situacao: "aberto" },
      `${chamado.criadoPorNome || "Alguém"} abriu o chamado "${chamado.titulo}" (${chamado.numero}).`
    ),
    link: `/suporte/${chamado.id}`
  });

  return chamado;

};

const atualizar = async (id, dados, autor) => {

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

  // resolvidoEm marca quando entrou em RESOLVIDO -- usado pelo job que
  // fecha sozinho 24h depois. Limpa se mudar pra qualquer outro status
  // (reabriu), senão o job fecharia contando a partir da vez errada.
  if (dados.status !== undefined) {
    if (dados.status === "RESOLVIDO" && anterior?.status !== "RESOLVIDO") {
      dados.resolvidoEm = new Date();
    } else if (dados.status !== "RESOLVIDO") {
      dados.resolvidoEm = null;
    }
  }

  const chamado = await prisma.chamado.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SUPORTE",
    registroId: chamado.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: chamado
  });

  const alteracoes = diffCampos(anterior, chamado, CAMPOS_CHAMADO);

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SUPORTE",
    acao: "ATUALIZAR",
    descricao: `Chamado "${chamado.titulo}" (${chamado.numero}) atualizado por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`
  });

  return chamado;

};

const remover = async (id, autor) => {

  const chamado = await prisma.chamado.findUnique({
    where: { id }
  });

  if (!chamado) {
    throw new Error("Chamado não encontrado.");
  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SUPORTE",
    registroId: chamado.id,
    acao: "EXCLUIR",
    valorAnterior: chamado,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SUPORTE",
    acao: "EXCLUIR",
    descricao: `Chamado "${chamado.titulo}" (${chamado.numero}) excluído por ${autor?.nome || "Sistema"}.`
  });

  const removido = await prisma.chamado.delete({
    where: { id }
  });

  // Sem isso, uma notificação antiga continua linkando pra um id que
  // não existe mais -- clicar nela cai em "não encontrado" em vez de
  // abrir alguma coisa. Nunca pode impedir a exclusão em si.
  try {
    await notificacaoService.removerPorLink(`/suporte/${id}`);
  } catch (erro) {
    console.error('[notificacao] Falha ao limpar notificações do chamado excluído:', erro.message);
  }

  return removido;

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
