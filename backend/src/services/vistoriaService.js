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

// "Missões" (ver VistoriaMissao/VistoriaProgresso) cobrem TODAS as
// residências ativas do sistema, não só as do locador de quem está
// concluindo -- vistoria "Geral" foi definida assim de propósito (ver
// decisão do usuário).
const residenciasAtivasIds = async () => {
  const residencias = await prisma.unidade.findMany({ where: { status: 'Ativa' }, select: { id: true } });
  return residencias.map((u) => u.id);
};

// Resumo de uma vistoria "Geral" pro card da lista -- cada residência
// tem seu PRÓPRIO relógio (ver VistoriaProgresso). "concluídas" é
// literal: quantas JÁ tiveram pelo menos uma vistoria de verdade
// registrada (tem VistoriaProgresso = já apareceu em alguma
// VistoriaMissao). Residência nunca tocada NÃO conta, mesmo que o
// prazo dela ainda nem tenha vencido -- "em dia" tinha o problema de
// contar quem nunca foi vistoriada como se já tivesse sido, só porque
// o primeiro prazo ainda não chegou (ex.: vistoria recém-criada,
// ninguém fez nada, mas mostrava "7/7" preenchido).
const progressoMissoes = (vistoria, idsResidenciasAtivas) => {

  if (vistoria.unidadeId) return null; // não é "Geral", não tem missão

  const progressoPorUnidade = new Map((vistoria.progressos || []).map((p) => [p.unidadeId, p]));

  const concluidas = idsResidenciasAtivas.filter(
    (unidadeId) => progressoPorUnidade.get(unidadeId)?.dataUltima
  ).length;

  return { concluidas, total: idsResidenciasAtivas.length };

};

const listar = async (usuario) => {

  const [vistorias, idsResidenciasAtivas] = await Promise.all([
    prisma.vistoria.findMany({
      where: filtroVistoria(usuario),
      include: {
        ocorrencias: true,
        unidade: true,
        kitnet: true,
        progressos: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    residenciasAtivasIds(),
  ]);

  return vistorias.map((v) => ({
    ...v,
    progressoMissoes: progressoMissoes(v, idsResidenciasAtivas),
  }));

};

const buscarPorId = async (id) => {

  const [vistoria, idsResidenciasAtivas] = await Promise.all([
    prisma.vistoria.findUnique({
      where: { id },
      include: {
        ocorrencias: true,
        unidade: true,
        kitnet: true,
        progressos: { include: { unidade: true } },
        missoes: { include: { unidade: true }, orderBy: { createdAt: 'desc' } },
      }
    }),
    residenciasAtivasIds(),
  ]);

  if (!vistoria) return null;

  return { ...vistoria, progressoMissoes: progressoMissoes(vistoria, idsResidenciasAtivas) };

};

const converterDatas = (dados) => {

  if (dados.data !== undefined) dados.data = paraDataOuNull(dados.data);
  if (dados.dataUltima !== undefined) dados.dataUltima = paraDataOuNull(dados.dataUltima);
  if (dados.concluidaEm !== undefined) dados.concluidaEm = paraDataOuNull(dados.concluidaEm);

  if (dados.dataProxima !== undefined) {
    dados.dataProxima = paraDataOuNull(dados.dataProxima);
    // "Próxima Execução" editada à mão vira a nova âncora pras
    // residências de uma vistoria "Geral" que ainda não têm relógio
    // próprio (ver VistoriaProgresso/dataProximaBase) -- concluirMissoes
    // nunca passa por aqui, só essa edição manual do usuário.
    dados.dataProximaBase = dados.dataProxima;
  }

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

// Checklist de uma vistoria "Geral" -- uma linha por residência ativa,
// cada uma com o SEU PRÓPRIO relógio (cicloAtual/dataProxima, ver
// VistoriaProgresso): uma não espera a outra pra reprogramar.
// Residência que nunca teve VistoriaProgresso (nunca foi tocada) usa
// dataProximaBase da vistoria como sua data inicial.
const listarMissoes = async (vistoriaId) => {

  const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

  if (!vistoria) {
    throw new Error('Vistoria não encontrada.');
  }

  if (vistoria.unidadeId) {
    throw new Error('Essa vistoria não é "Geral" -- não tem missões por residência.');
  }

  const [residencias, progressos, missoes] = await Promise.all([
    prisma.unidade.findMany({ where: { status: 'Ativa' }, orderBy: { nome: 'asc' } }),
    prisma.vistoriaProgresso.findMany({ where: { vistoriaId } }),
    prisma.vistoriaMissao.findMany({ where: { vistoriaId }, orderBy: { ciclo: 'desc' } }),
  ]);

  const progressoPorUnidade = new Map(progressos.map((p) => [p.unidadeId, p]));

  const ultimaMissaoPorUnidade = new Map();
  for (const missao of missoes) {
    if (!ultimaMissaoPorUnidade.has(missao.unidadeId)) {
      ultimaMissaoPorUnidade.set(missao.unidadeId, missao);
    }
  }

  const seed = vistoria.dataProximaBase || vistoria.dataProxima;
  const agora = new Date();

  return {
    vistoriaId,
    residencias: residencias.map((u) => {

      const progresso = progressoPorUnidade.get(u.id);
      const ultimaMissao = ultimaMissaoPorUnidade.get(u.id);
      const dataProxima = progresso ? progresso.dataProxima : seed;

      return {
        unidadeId: u.id,
        unidadeNome: u.nome,
        cicloAtual: progresso?.cicloAtual || 1,
        dataUltima: progresso?.dataUltima || null,
        dataProxima,
        nuncaVistoriada: !progresso?.dataUltima,
        atrasada: !!dataProxima && dataProxima <= agora,
        realizadoPor: ultimaMissao?.realizadoPor || null,
        fotos: ultimaMissao?.fotos || null,
        observacoes: ultimaMissao?.observacoes || null,
      };

    }),
  };

};

// Bate o check de uma ou mais residências -- cada uma reprograma SÓ O
// PRÓPRIO relógio na hora (VistoriaProgresso), sem esperar as outras:
// VIME I concluída hoje e VIME II concluída amanhã saem com próximas
// datas diferentes, cada uma contada a partir do que já estava
// programado PRA ELA.
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
  const agora = new Date();
  const seed = vistoria.dataProximaBase || vistoria.dataProxima;

  const progressosExistentes = await prisma.vistoriaProgresso.findMany({
    where: { vistoriaId, unidadeId: { in: unidadeIds } },
  });
  const progressoPorUnidade = new Map(progressosExistentes.map((p) => [p.unidadeId, p]));

  const progressosAtualizados = [];

  for (const unidadeId of unidadeIds) {

    const progresso = progressoPorUnidade.get(unidadeId);
    const cicloDaResidencia = progresso?.cicloAtual || 1;

    await prisma.vistoriaMissao.upsert({
      where: {
        vistoriaId_unidadeId_ciclo: { vistoriaId, unidadeId, ciclo: cicloDaResidencia },
      },
      create: {
        vistoriaId,
        unidadeId,
        ciclo: cicloDaResidencia,
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
    });

    // Avança a partir da data que JÁ estava programada PRA ESSA
    // residência (não da data de hoje, nem da de outra residência),
    // com salto de ciclos se concluiu bem atrasada, pra não perder o
    // dia fixo da recorrência.
    const baseAncora = new Date(progresso?.dataProxima || seed || dataEscolhida);
    let proximaData = avancarUmaVez(baseAncora, vistoria.periodicidade);
    const recorrente = proximaData !== null;

    if (recorrente) {
      while (proximaData <= agora) {
        proximaData = avancarUmaVez(proximaData, vistoria.periodicidade);
      }
    }

    const progressoAtualizado = await prisma.vistoriaProgresso.upsert({
      where: {
        vistoriaId_unidadeId: { vistoriaId, unidadeId },
      },
      create: {
        vistoriaId,
        unidadeId,
        cicloAtual: cicloDaResidencia + 1,
        dataUltima: dataEscolhida,
        dataProxima: recorrente ? proximaData : null,
      },
      update: {
        cicloAtual: cicloDaResidencia + 1,
        dataUltima: dataEscolhida,
        dataProxima: recorrente ? proximaData : null,
      },
    });

    progressosAtualizados.push(progressoAtualizado);

  }

  // O card da vistoria mostra um resumo geral -- "Próxima Execução"
  // vira a data mais próxima entre TODAS as residências ativas (o que
  // tiver vencendo primeiro), "Última Execução" a mais recente feita.
  // Residência ainda sem VistoriaProgresso (nunca tocada) entra na
  // conta com o seed.
  const [residenciasAtivas, todosProgressos] = await Promise.all([
    prisma.unidade.findMany({ where: { status: 'Ativa' }, select: { id: true } }),
    prisma.vistoriaProgresso.findMany({ where: { vistoriaId } }),
  ]);

  const progressoPorUnidadeFinal = new Map(todosProgressos.map((p) => [p.unidadeId, p]));

  let proximaAgregada = null;
  let ultimaAgregada = null;
  let algumaRecorrente = false;

  for (const u of residenciasAtivas) {

    const p = progressoPorUnidadeFinal.get(u.id);
    const dataProximaDaResidencia = p ? p.dataProxima : seed;

    if (dataProximaDaResidencia) {
      algumaRecorrente = true;
      if (!proximaAgregada || dataProximaDaResidencia < proximaAgregada) {
        proximaAgregada = dataProximaDaResidencia;
      }
    }

    if (p?.dataUltima && (!ultimaAgregada || p.dataUltima > ultimaAgregada)) {
      ultimaAgregada = p.dataUltima;
    }

  }

  const vistoriaAtualizada = await prisma.vistoria.update({
    where: { id: vistoriaId },
    data: {
      status: algumaRecorrente ? 'PROGRAMADA' : 'REALIZADA',
      dataUltima: ultimaAgregada,
      dataProxima: proximaAgregada,
      concluidaEm: new Date(),
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
    descricao: `Vistoria "${vistoria.titulo}": ${unidadeIds.length} residência(s) concluída(s) por ${autor?.nome || "Sistema"}, cada uma com sua própria próxima data.`
  });

  return {
    progresso: progressosAtualizados,
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
//
// De propósito SEM o conteúdo de "fotos" aqui: cada mídia é um `data:`
// URL (texto gigante, até dezena de MB cada) e esse histórico só
// cresce com o tempo -- já passou de 25MB só nessa coluna somando
// tudo, e a consulta começou a falhar ("Server has closed the
// connection") assim que acumulou uns dias de vistoria com foto. A
// lista só precisa de QUANTAS fotos tem (pro badge) -- o conteúdo de
// verdade só é buscado quando abre uma missão específica (ver
// buscarMissao), uma de cada vez.
const listarMissoesRealizadas = async () => {

  const linhas = await prisma.$queryRaw`
    SELECT
      vm.id,
      vm."vistoriaId",
      vm."unidadeId",
      vm.ciclo,
      vm."dataRealizacao",
      vm."realizadoPor",
      vm.observacoes,
      COALESCE(jsonb_array_length(vm.fotos), 0)::int AS "fotosCount",
      v.titulo AS "vistoriaTitulo",
      u.nome AS "unidadeNome"
    FROM "VistoriaMissao" vm
    JOIN "Vistoria" v ON v.id = vm."vistoriaId"
    JOIN "Unidade" u ON u.id = vm."unidadeId"
    ORDER BY vm."dataRealizacao" DESC
  `;

  return linhas.map((l) => ({
    id: l.id,
    vistoriaId: l.vistoriaId,
    unidadeId: l.unidadeId,
    ciclo: l.ciclo,
    dataRealizacao: l.dataRealizacao,
    realizadoPor: l.realizadoPor,
    observacoes: l.observacoes,
    fotosCount: l.fotosCount,
    vistoria: { titulo: l.vistoriaTitulo },
    unidade: { nome: l.unidadeNome },
  }));

};

// Uma missão só, com o conteúdo de "fotos" completo -- usado quando
// abre o detalhe/edição de UM registro (ver listarMissoesRealizadas
// acima pro motivo de não vir tudo junto na lista).
const buscarMissao = (missaoId) => {
  return prisma.vistoriaMissao.findUnique({
    where: { id: missaoId },
    include: { unidade: true, vistoria: true },
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
// Cada conclusão já reprograma na hora o relógio DAQUELA residência
// (ver concluirMissoes) -- se o registro apagado era o mais recente
// dela, o relógio (VistoriaProgresso) volta pro que sobrar do
// histórico, ou zera se não sobrar nada. Não mexe no resumo
// (status/dataProxima) da vistoria em si -- esse só se reajusta sozinho
// na próxima conclusão.
const removerMissao = async (missaoId) => {

  const missao = await prisma.vistoriaMissao.findUnique({ where: { id: missaoId } });

  if (!missao) {
    throw new Error('Registro não encontrado.');
  }

  await prisma.vistoriaMissao.delete({ where: { id: missaoId } });

  const restantes = await prisma.vistoriaMissao.findMany({
    where: { vistoriaId: missao.vistoriaId, unidadeId: missao.unidadeId },
    orderBy: { ciclo: 'desc' },
    take: 1,
  });

  if (restantes.length > 0) {

    const ultima = restantes[0];
    const vistoria = await prisma.vistoria.findUnique({ where: { id: missao.vistoriaId } });

    await prisma.vistoriaProgresso.upsert({
      where: { vistoriaId_unidadeId: { vistoriaId: missao.vistoriaId, unidadeId: missao.unidadeId } },
      create: {
        vistoriaId: missao.vistoriaId,
        unidadeId: missao.unidadeId,
        cicloAtual: ultima.ciclo + 1,
        dataUltima: ultima.dataRealizacao,
        dataProxima: vistoria ? avancarUmaVez(new Date(ultima.dataRealizacao), vistoria.periodicidade) : null,
      },
      update: {
        cicloAtual: ultima.ciclo + 1,
        dataUltima: ultima.dataRealizacao,
        dataProxima: vistoria ? avancarUmaVez(new Date(ultima.dataRealizacao), vistoria.periodicidade) : null,
      },
    });

  } else {

    await prisma.vistoriaProgresso.deleteMany({
      where: { vistoriaId: missao.vistoriaId, unidadeId: missao.unidadeId },
    });

  }

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
  buscarMissao,
  atualizarMissao,
  removerMissao,
};