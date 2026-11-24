const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const notificacaoService = require('./notificacaoService');
const whatsappAutomacaoService = require('./whatsappAutomacaoService');
const { filtroSolicitacao } = require('../utils/escopoLocador');
const campoObrigatorioService = require('./campoObrigatorioService');
const { diffCampos } = require('../utils/diffCampos');

// Aprovador fixo de solicitações (pedido do usuário em 24/11/2026 --
// "um número fixo", não por perfil). É um e-mail (não o telefone cru)
// de propósito -- se ele trocar de celular, só precisa atualizar o
// telefone no cadastro dele (Configurações > Usuários) que isso aqui
// continua funcionando sozinho.
const EMAIL_APROVADOR_SOLICITACAO = 'arthurbezerra1705@gmail.com';

const obterAprovador = () => prisma.usuario.findUnique({
  where: { email: EMAIL_APROVADOR_SOLICITACAO },
});

const CAMPOS_SOLICITACAO = {
  titulo: 'título',
  responsavel: 'responsável',
  status: 'status',
  prazo: { rotulo: 'prazo', tipo: 'data' },
};

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
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: solicitacao
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SOLICITACOES",
    acao: "CRIAR",
    descricao: `Solicitação "${solicitacao.titulo}" (${solicitacao.numero}) criada por ${autor?.nome || "Sistema"}.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Nova solicitação",
    mensagem: await notificacaoService.renderizarMensagem(
      'SOLICITACAO_NOVA',
      { autor: solicitacao.criadoPorNome || "Alguém", titulo: solicitacao.titulo, numero: solicitacao.numero },
      `🛠️ ${solicitacao.criadoPorNome || "Alguém"} abriu a solicitação "${solicitacao.titulo}" (${solicitacao.numero}). Dá uma olhada quando puder!`
    ),
    link: `/solicitacoes/${solicitacao.id}`,
    locadorId: solicitacao.locadorId
  });

  // Toda solicitação nova nasce "AGUARDANDO" aprovação -- manda de
  // uma vez a pergunta pro aprovador fixo por WhatsApp (responde SIM
  // ou NÃO, ver whatsappService.webhook). Best-effort: nunca trava a
  // criação se o WhatsApp falhar (sem telefone configurado, Meta fora
  // do ar etc.) -- o botão Aprovar/Rejeitar no app continua
  // funcionando igual. Pedido do usuário em 24/11/2026.
  try {

    const aprovador = await obterAprovador();

    if (aprovador?.telefone) {

      await whatsappAutomacaoService.notificarSistemaWhatsapp(
        aprovador,
        'Nova solicitação aguardando aprovação',
        `${solicitacao.criadoPorNome || 'Alguém'} abriu a solicitação "${solicitacao.titulo}" (${solicitacao.numero}).\n\n${solicitacao.descricao || 'Sem descrição.'}\n\nResponda SIM para aprovar ou NÃO para recusar.`
      );

    }

  } catch (erro) {
    console.error('[solicitacao] Falha ao avisar aprovador por WhatsApp:', erro.message);
  }

  return solicitacao;

};

const atualizar = async (id, dados, autor) => {

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
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: solicitacao
  });

  const alteracoes = diffCampos(anterior, solicitacao, CAMPOS_SOLICITACAO);

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SOLICITACOES",
    acao: "ATUALIZAR",
    descricao: `Solicitação "${solicitacao.titulo}" (${solicitacao.numero}) atualizada por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`
  });

  return solicitacao;

};

const remover = async (id, autor) => {

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id }
  });

  if (!solicitacao) {
    throw new Error("Solicitação não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SOLICITACOES",
    registroId: solicitacao.id,
    acao: "EXCLUIR",
    valorAnterior: solicitacao,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "SOLICITACOES",
    acao: "EXCLUIR",
    descricao: `Solicitação "${solicitacao.titulo}" (${solicitacao.numero}) excluída por ${autor?.nome || "Sistema"}.`
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

// Aprovar/Rejeitar -- mesma função serve o botão do app (autor = quem
// clicou) e a resposta por WhatsApp (ver responderAprovacaoPorWhatsapp
// logo abaixo). Nunca mexe em `status` quando aprova (ela segue o
// fluxo normal -- SOLICITADA, EM COTAÇÃO etc.); quando rejeita,
// também marca `status: REJEITADA` pra sumir das listas de "em
// aberto" igual qualquer outra rejeição já fazia antes disso existir.
const responderAprovacao = async (id, resposta, autor) => {

  if (!['APROVADA', 'REJEITADA'].includes(resposta)) {
    const erro = new Error('Resposta inválida -- precisa ser APROVADA ou REJEITADA.');
    erro.status = 400;
    throw erro;
  }

  const solicitacao = await prisma.solicitacao.findUnique({ where: { id } });

  if (!solicitacao) {
    const erro = new Error('Solicitação não encontrada.');
    erro.status = 404;
    throw erro;
  }

  if (solicitacao.aprovacaoStatus !== 'AGUARDANDO') {
    const erro = new Error(`Essa solicitação já foi ${solicitacao.aprovacaoStatus === 'APROVADA' ? 'aprovada' : 'rejeitada'} antes.`);
    erro.status = 400;
    throw erro;
  }

  const atualizada = await prisma.solicitacao.update({
    where: { id },
    data: {
      aprovacaoStatus: resposta,
      aprovacaoEm: new Date(),
      aprovacaoPor: autor?.nome || 'Sistema',
      ...(resposta === 'REJEITADA' ? { status: 'REJEITADA' } : {}),
    },
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || 'Sistema',
    modulo: 'SOLICITACOES',
    registroId: solicitacao.id,
    acao: 'ATUALIZAR',
    valorAnterior: solicitacao,
    valorNovo: atualizada,
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || 'Sistema',
    modulo: 'SOLICITACOES',
    acao: 'ATUALIZAR',
    descricao: `Solicitação "${solicitacao.titulo}" (${solicitacao.numero}) ${resposta === 'APROVADA' ? 'aprovada' : 'rejeitada'} por ${autor?.nome || 'Sistema'}.`,
  });

  await notificacaoService.criar({
    origem: 'SISTEMA',
    titulo: resposta === 'APROVADA' ? 'Solicitação aprovada' : 'Solicitação rejeitada',
    mensagem: `${autor?.nome || 'Alguém'} ${resposta === 'APROVADA' ? 'aprovou' : 'rejeitou'} a solicitação "${solicitacao.titulo}" (${solicitacao.numero}).`,
    link: `/solicitacoes/${solicitacao.id}`,
    locadorId: solicitacao.locadorId,
  });

  return atualizada;

};

// Chamado pelo webhook do WhatsApp quando o aprovador fixo responde
// "SIM"/"NÃO" (ver whatsappService.webhook) -- não dá pra saber QUAL
// solicitação ele está respondendo só pelo texto, então resolve
// sempre a mais antiga ainda AGUARDANDO (fila FIFO); por isso a
// resposta de confirmação (mandada de volta por quem chamou essa
// função) sempre ecoa o número/título de qual solicitação foi
// resolvida, pra nunca ficar na dúvida. `null` = não tinha nenhuma
// aguardando (ex.: respondeu de novo depois de já ter resolvido).
const responderAprovacaoPorWhatsapp = async (resposta) => {

  const pendente = await prisma.solicitacao.findFirst({
    where: { aprovacaoStatus: 'AGUARDANDO' },
    orderBy: { createdAt: 'asc' },
  });

  if (!pendente) return null;

  return responderAprovacao(pendente.id, resposta, { id: null, nome: 'WhatsApp (aprovador)' });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  responderAprovacao,
  responderAprovacaoPorWhatsapp,
  obterAprovador,
};