const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const campoObrigatorioService = require('./campoObrigatorioService');
const { filtroVistoria } = require('../utils/escopoLocador');
const notificacaoService = require('./notificacaoService');
const { diffCampos } = require('../utils/diffCampos');

const CAMPOS_VISTORIA = {
  titulo: 'título',
  categoria: 'categoria',
  criticidade: 'criticidade',
  status: 'status',
  periodicidade: 'periodicidade',
  dataProxima: { rotulo: 'data próxima', tipo: 'data' },
};

// Um passo da periodicidade (null = "Única", não repete). Mesma lógica
// do frontend (vistorias/page.js) -- precisa existir aqui também pro
// fechamento de ciclo de uma vistoria "Geral" rodar sozinho no backend.
const avancarUmaVez = (data, periodicidade) => {

  const nova = new Date(data);

  switch (periodicidade) {

    case 'Diária': nova.setDate(nova.getDate() + 1); break;
    case 'Semanal': nova.setDate(nova.getDate() + 7); break;
    case 'Quinzenal': nova.setDate(nova.getDate() + 15); break;
    case 'Mensal': nova.setMonth(nova.getMonth() + 1); break;
    case 'Bimestral': nova.setMonth(nova.getMonth() + 2); break;
    case 'Trimestral': nova.setMonth(nova.getMonth() + 3); break;
    case 'Semestral': nova.setMonth(nova.getMonth() + 6); break;
    case 'Anual': nova.setFullYear(nova.getFullYear() + 1); break;
    default: return null;

  }

  return nova;

};

// "Missões" (ver VistoriaMissao) cobrem TODAS as residências ativas do
// sistema, não só as do locador de quem está concluindo -- vistoria
// "Geral" foi definida assim de propósito (ver decisão do usuário).
const contarResidenciasAtivas = () => {
  return prisma.unidade.count({ where: { status: 'Ativa' } });
};

// Progresso da rodada atual de uma vistoria "Geral" -- só as missões
// batidas no cicloAtual contam (rodadas antigas já fecharam e viram
// histórico no Arquivo).
const progressoMissoes = (vistoria, totalResidenciasAtivas) => {

  if (vistoria.unidadeId) return null; // não é "Geral", não tem missão

  const concluidas = (vistoria.missoes || []).filter(
    (m) => m.ciclo === vistoria.cicloAtual
  ).length;

  return { concluidas, total: totalResidenciasAtivas };

};

const listar = async (usuario) => {

  const [vistorias, totalResidenciasAtivas] = await Promise.all([
    prisma.vistoria.findMany({
      where: filtroVistoria(usuario),
      include: {
        ocorrencias: true,
        unidade: true,
        kitnet: true,
        missoes: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    contarResidenciasAtivas(),
  ]);

  return vistorias.map((v) => ({
    ...v,
    progressoMissoes: progressoMissoes(v, totalResidenciasAtivas),
  }));

};

const buscarPorId = async (id) => {

  const [vistoria, totalResidenciasAtivas] = await Promise.all([
    prisma.vistoria.findUnique({
      where: { id },
      include: {
        ocorrencias: true,
        unidade: true,
        kitnet: true,
        missoes: { include: { unidade: true }, orderBy: { createdAt: 'desc' } },
      }
    }),
    contarResidenciasAtivas(),
  ]);

  if (!vistoria) return null;

  return { ...vistoria, progressoMissoes: progressoMissoes(vistoria, totalResidenciasAtivas) };

};

const converterDatas = (dados) => {

  if (dados.data !== undefined) dados.data = paraDataOuNull(dados.data);
  if (dados.dataUltima !== undefined) dados.dataUltima = paraDataOuNull(dados.dataUltima);
  if (dados.dataProxima !== undefined) dados.dataProxima = paraDataOuNull(dados.dataProxima);
  if (dados.concluidaEm !== undefined) dados.concluidaEm = paraDataOuNull(dados.concluidaEm);

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.historico;
  delete dados.ocorrencias;
  delete dados.unidade;
  delete dados.kitnet;

  return dados;

};

const criar = async (dados, autor) => {

  dados = converterDatas(dados);

  // kitnetId null de propósito = "Geral" (residência inteira, ou --
  // se unidadeId também for null -- o sistema inteiro) -- escolha
  // válida mesmo com esses campos marcados obrigatórios em Campos
  // Obrigatórios.
  const ignorar = [
    ...(dados.kitnetId === null ? ['kitnetId'] : []),
    ...(dados.unidadeId === null ? ['unidadeId'] : []),
  ];

  await campoObrigatorioService.validar('vistoria', dados, { ignorar });

  const vistoria = await prisma.vistoria.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: vistoria
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    acao: "CRIAR",
    descricao: `Vistoria "${vistoria.titulo}" criada por ${autor?.nome || "Sistema"}.`
  });

  // Aviso na hora (sino, som e popup no celular) -- o locador é descoberto
  // pelo link. Nunca pode impedir a vistoria de ser criada.
  try {
    await notificacaoService.criar({
      origem: 'SISTEMA',
      titulo: 'Nova vistoria',
      mensagem: await notificacaoService.renderizarMensagem(
        'VISTORIA_NOVA',
        { titulo: vistoria.titulo },
        `🔍 Nova vistoria na área: "${vistoria.titulo}". Bora conferir quando der!`
      ),
      link: `/vistorias/${vistoria.id}`
    });
  } catch (erro) {
    console.error('[notificacao] Falha ao avisar vistoria nova:', erro.message);
  }

  return vistoria;

};

const atualizar = async (id, dados, autor) => {

  dados = converterDatas(dados);

  const anterior = await prisma.vistoria.findUnique({
    where: { id }
  });

  // Atualização parcial (ex.: só muda o status ao concluir) não pode
  // reprovar por "falta" um campo que já está preenchido desde a
  // criação -- valida o resultado final (anterior + alterações), não só
  // o pedaço que veio nesta chamada. kitnetId/unidadeId null de
  // propósito = "Geral".
  const mesclado = { ...anterior, ...dados };
  const ignorar = [
    ...(mesclado.kitnetId === null ? ['kitnetId'] : []),
    ...(mesclado.unidadeId === null ? ['unidadeId'] : []),
  ];

  await campoObrigatorioService.validar('vistoria', mesclado, { ignorar });

  const vistoria = await prisma.vistoria.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: vistoria
  });

  const alteracoes = diffCampos(anterior, vistoria, CAMPOS_VISTORIA);

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    acao: "ATUALIZAR",
    descricao: `Vistoria "${vistoria.titulo}" atualizada por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`
  });

  return vistoria;

};

const remover = async (id, autor) => {

  const vistoria = await prisma.vistoria.findUnique({
    where: { id }
  });

  if (!vistoria) {
    throw new Error("Vistoria não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "EXCLUIR",
    valorAnterior: vistoria,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    acao: "EXCLUIR",
    descricao: `Vistoria "${vistoria.titulo}" excluída por ${autor?.nome || "Sistema"}.`
  });

  const removida = await prisma.vistoria.delete({
    where: { id }
  });

  // Sem isso, uma notificação antiga (ex.: "Nova vistoria") continua
  // linkando pra um id que não existe mais -- clicar nela cai em
  // "Vistoria não encontrada" em vez de abrir alguma coisa. Nunca pode
  // impedir a exclusão em si.
  try {
    await notificacaoService.removerPorLink(`/vistorias/${id}`);
  } catch (erro) {
    console.error('[notificacao] Falha ao limpar notificações da vistoria excluída:', erro.message);
  }

  return removida;

};

// Checklist da rodada atual (ciclo) de uma vistoria "Geral" -- uma
// "missão" por residência ativa, batida ou não.
const listarMissoes = async (vistoriaId) => {

  const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

  if (!vistoria) {
    throw new Error('Vistoria não encontrada.');
  }

  if (vistoria.unidadeId) {
    throw new Error('Essa vistoria não é "Geral" -- não tem missões por residência.');
  }

  const [residencias, missoes] = await Promise.all([
    prisma.unidade.findMany({ where: { status: 'Ativa' }, orderBy: { nome: 'asc' } }),
    prisma.vistoriaMissao.findMany({ where: { vistoriaId, ciclo: vistoria.cicloAtual } }),
  ]);

  const porUnidade = new Map(missoes.map((m) => [m.unidadeId, m]));

  return {
    vistoriaId,
    ciclo: vistoria.cicloAtual,
    residencias: residencias.map((u) => {
      const missao = porUnidade.get(u.id);
      return {
        unidadeId: u.id,
        unidadeNome: u.nome,
        concluida: !!missao,
        dataRealizacao: missao?.dataRealizacao || null,
        realizadoPor: missao?.realizadoPor || null,
        fotos: missao?.fotos || null,
        observacoes: missao?.observacoes || null,
      };
    }),
  };

};

// Bate o check de uma ou mais residências na rodada atual. Quando todas
// as residências ativas tiverem missão no ciclo, fecha a rodada --
// igual concluir uma vistoria normal (renova sozinha pra próxima data
// se tiver periodicidade) -- e abre um ciclo novo e vazio.
const concluirMissoes = async (vistoriaId, { unidadeIds, dataRealizacao, fotos, realizadoPor, observacoes }, autor) => {

  if (!Array.isArray(unidadeIds) || unidadeIds.length === 0) {
    throw new Error('Selecione ao menos uma residência.');
  }

  const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

  if (!vistoria) {
    throw new Error('Vistoria não encontrada.');
  }

  if (vistoria.unidadeId) {
    throw new Error('Essa vistoria não é "Geral" -- não tem missões por residência.');
  }

  const dataEscolhida = dataRealizacao ? new Date(dataRealizacao) : new Date();

  await Promise.all(unidadeIds.map((unidadeId) =>
    prisma.vistoriaMissao.upsert({
      where: {
        vistoriaId_unidadeId_ciclo: { vistoriaId, unidadeId, ciclo: vistoria.cicloAtual },
      },
      create: {
        vistoriaId,
        unidadeId,
        ciclo: vistoria.cicloAtual,
        dataRealizacao: dataEscolhida,
        realizadoPor: realizadoPor || null,
        fotos: fotos || null,
        observacoes: observacoes || null,
      },
      update: {
        dataRealizacao: dataEscolhida,
        realizadoPor: realizadoPor || null,
        fotos: fotos || null,
        observacoes: observacoes || null,
      },
    })
  ));

  const [totalAtivas, concluidas] = await Promise.all([
    contarResidenciasAtivas(),
    prisma.vistoriaMissao.count({ where: { vistoriaId, ciclo: vistoria.cicloAtual } }),
  ]);

  const fechouCiclo = concluidas >= totalAtivas;

  if (!fechouCiclo) {
    return { fechouCiclo: false, progresso: { concluidas, total: totalAtivas } };
  }

  // Igual ao fluxo de "Realizar" de uma vistoria normal: avança a partir
  // da data que JÁ estava programada (não da data de conclusão), com
  // salto de ciclos se concluiu bem atrasado, pra não perder o dia fixo
  // da recorrência.
  const baseAncora = vistoria.dataProxima ? new Date(vistoria.dataProxima) : dataEscolhida;
  let proximaData = avancarUmaVez(baseAncora, vistoria.periodicidade);
  const recorrente = proximaData !== null;

  if (recorrente) {
    const agora = new Date();
    while (proximaData <= agora) {
      proximaData = avancarUmaVez(proximaData, vistoria.periodicidade);
    }
  }

  const vistoriaAtualizada = await prisma.vistoria.update({
    where: { id: vistoriaId },
    data: {
      status: recorrente ? 'PROGRAMADA' : 'REALIZADA',
      dataUltima: dataEscolhida,
      dataProxima: recorrente ? proximaData : null,
      concluidaEm: new Date(),
      cicloAtual: vistoria.cicloAtual + 1,
    },
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "ATUALIZAR",
    valorAnterior: vistoria,
    valorNovo: vistoriaAtualizada
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    acao: "ATUALIZAR",
    descricao: `Vistoria "${vistoria.titulo}": todas as missões do ciclo ${vistoria.cicloAtual} concluídas por ${autor?.nome || "Sistema"}, rodada fechada.`
  });

  return {
    fechouCiclo: true,
    progresso: { concluidas, total: totalAtivas },
    vistoria: vistoriaAtualizada,
  };

};

// Desfaz o último "Realizar" de uma vistoria normal (não "Geral") --
// ex.: marcou como realizada a kitnet errada. Restaura status, datas,
// fotos e observações de antes dessa conclusão, lendo o snapshot que
// a própria auditoria (ver atualizar()) já guarda de toda alteração.
// Para vistoria "Geral" é a missão específica que se desfaz (ver
// removerMissao), não a vistoria inteira.
const cancelarRealizacao = async (vistoriaId, autor) => {

  const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

  if (!vistoria) {
    throw new Error('Vistoria não encontrada.');
  }

  if (!vistoria.unidadeId) {
    throw new Error('Essa é uma vistoria "Geral" -- exclua a missão da residência errada em vez de cancelar a vistoria inteira.');
  }

  if (!vistoria.concluidaEm) {
    throw new Error('Essa vistoria ainda não foi realizada.');
  }

  const ultimaAuditoria = await prisma.auditoria.findFirst({
    where: { modulo: 'VISTORIAS', registroId: vistoriaId, acao: 'ATUALIZAR' },
    orderBy: { createdAt: 'desc' },
  });

  const anterior = ultimaAuditoria?.valorAnterior;

  // Só desfaz se o último ATUALIZAR registrado for mesmo o "Realizar"
  // que estamos tentando cancelar (concluidaEm bate com o atual) --
  // evita desfazer por engano uma edição qualquer feita depois dele.
  const foiEssaConclusao =
    anterior &&
    ultimaAuditoria.valorNovo?.concluidaEm &&
    new Date(ultimaAuditoria.valorNovo.concluidaEm).getTime() === new Date(vistoria.concluidaEm).getTime();

  if (!foiEssaConclusao) {
    throw new Error('Não foi possível identificar a conclusão a desfazer -- pode já ter sido editada depois de concluída.');
  }

  const revertida = await prisma.vistoria.update({
    where: { id: vistoriaId },
    data: {
      status: anterior.status,
      dataUltima: anterior.dataUltima ? new Date(anterior.dataUltima) : null,
      dataProxima: anterior.dataProxima ? new Date(anterior.dataProxima) : null,
      concluidaEm: anterior.concluidaEm ? new Date(anterior.concluidaEm) : null,
      fotosConclusao: anterior.fotosConclusao || null,
      observacoesConclusao: anterior.observacoesConclusao || null,
    },
  });

  await auditoriaService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "ATUALIZAR",
    valorAnterior: vistoria,
    valorNovo: revertida,
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "VISTORIAS",
    acao: "ATUALIZAR",
    descricao: `Vistoria "${vistoria.titulo}": conclusão desfeita por ${autor?.nome || "Sistema"}.`,
  });

  return revertida;

};

// Histórico de missões concluídas (todas as rodadas, de todas as
// vistorias "Geral") -- base da aba Realizadas.
const listarMissoesRealizadas = () => {
  return prisma.vistoriaMissao.findMany({
    include: { unidade: true, vistoria: true },
    orderBy: { dataRealizacao: 'desc' },
  });
};

// Corrige uma missão já registrada (data, responsável, observações,
// fotos) -- não mexe em qual residência/ciclo ela representa, só o
// que foi anotado na hora de concluir.
const atualizarMissao = async (missaoId, { dataRealizacao, realizadoPor, observacoes, fotos }) => {

  const dados = {};

  if (dataRealizacao !== undefined) dados.dataRealizacao = new Date(dataRealizacao);
  if (realizadoPor !== undefined) dados.realizadoPor = realizadoPor || null;
  if (observacoes !== undefined) dados.observacoes = observacoes || null;
  if (fotos !== undefined) dados.fotos = fotos || null;

  return prisma.vistoriaMissao.update({
    where: { id: missaoId },
    data: dados,
    include: { unidade: true, vistoria: true },
  });

};

// Desfaz o registro de uma missão (ex.: marcou a residência errada).
// Se for do ciclo atual (ainda aberto), simplesmente "desmarca" a
// residência -- a vistoria não fecha a rodada até ela ser batida de
// novo. Não mexe no status/data da vistoria em si.
const removerMissao = async (missaoId) => {

  const missao = await prisma.vistoriaMissao.findUnique({ where: { id: missaoId } });

  if (!missao) {
    throw new Error('Registro não encontrado.');
  }

  await prisma.vistoriaMissao.delete({ where: { id: missaoId } });

  return missao;

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  listarMissoes,
  concluirMissoes,
  cancelarRealizacao,
  listarMissoesRealizadas,
  atualizarMissao,
  removerMissao,
};