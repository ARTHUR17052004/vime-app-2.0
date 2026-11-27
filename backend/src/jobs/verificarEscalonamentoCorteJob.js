const prisma = require('../config/prisma');
const vistoriaService = require('../services/vistoriaService');
const corteVistoriaService = require('../services/corteVistoriaService');
const diaUtil = require('../utils/diaUtil');

/*
  Terceiro (e último) estágio da escalada de corte de água/energia
  (pedido do usuário em 18/11/2026, prazo ajustado em 26/11/2026, etapa
  do meio inserida em 27/11/2026 -- ANTES era o segundo estágio,
  disparado direto de corteRealizadoEm). verificarAtrasoCorteJob.js
  cuida do primeiro (atraso 3 dias ÚTEIS+ -> vistoria "REALIZAR CORTE DE
  ÁGUA E ENERGIA") e verificarFecharPortaCorteJob.js cuida do segundo
  (corte realizado + 2 dias úteis -> "FECHAR PORTA COM GRADE"). Esse
  aqui cuida do terceiro: a vistoria de "fechar porta" foi Realizada
  (ver vistoriaService.atualizar, que grava Receita.portaFechadaEm) mas
  a cobrança continua sem resolver por mais 2 dias úteis -> dispara a
  vistoria "FAZER DESOCUPAÇÃO DE IMÓVEL", que ao ser Realizada encerra
  o contrato e libera a kitnet sozinha.

  "48h depois da porta fechada" = portaFechadaEm + 2 dias ÚTEIS (mesma
  régua de dias úteis dos outros estágios). vistoriaEsvaziarCriadaEm
  evita criar duas vezes pra mesma Receita.
*/
const resolverResponsavelZelador = async () => {

  const zeladores = await prisma.usuario.findMany({
    where: { ativo: true, perfil: { nome: 'ZELADOR' } },
    select: { nome: true },
    orderBy: { nome: 'asc' },
  });

  if (zeladores.length === 0) return 'Zelador';

  return zeladores.map((z) => z.nome).join(', ');

};

module.exports = async () => {

  const agora = new Date();

  // Pré-filtro solto (48h corridas) -- igual verificarAtrasoCorteJob.js,
  // a conta exata de 2 dias ÚTEIS é feita depois com diaUtil.
  const limite = new Date(agora);
  limite.setHours(limite.getHours() - 48);

  const candidatas = await prisma.receita.findMany({
    where: {
      portaFechadaEm: { not: null, lte: limite },
      vistoriaEsvaziarId: null,
      status: { notIn: ['PAGA', 'PAGO', 'CANCELADA'] },
      gatewayReferencia: { not: null },
      // Defesa em profundidade: portaFechadaEm só devia existir pra
      // Aluguel já (ver verificarFecharPortaCorteJob.js), mas confere
      // aqui também -- nunca esvaziar kitnet por causa de Taxa/Multa.
      categoria: 'Aluguel',
    },
    include: {
      contrato: { include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } },
    },
  });

  if (candidatas.length === 0) return;

  const feriadosSet = await diaUtil.obterFeriadosSet([agora.getFullYear(), agora.getFullYear() + 1]);

  const receitas = candidatas.filter(
    (receita) => diaUtil.adicionarDiasUteis(new Date(receita.portaFechadaEm), 2, feriadosSet) <= agora
  );

  if (receitas.length === 0) return;

  console.log(`[JOB] Criando vistoria de "desocupação de imóvel" pra ${receitas.length} cobrança(s) com porta fechada há 2 dias úteis+ sem quitação...`);

  const responsavel = await resolverResponsavelZelador();

  let criadas = 0;

  for (const receita of receitas) {

    const kitnet = receita.contrato?.kitnet || receita.inquilino?.kitnet;
    const unidade = receita.contrato?.unidade || receita.inquilino?.kitnet?.unidade;
    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (!kitnet || !unidade) continue;

    // Já existe uma "desocupação" aberta pra essa mesma kitnet -- não
    // cria outra, mesma trava de verificarAtrasoCorteJob.js.
    const jaTemDesocupacaoAberta = await prisma.vistoria.findFirst({
      where: { kitnetId: kitnet.id, titulo: corteVistoriaService.TITULO_FAZER_DESOCUPACAO, status: { notIn: ['CANCELADA', 'REALIZADA'] } },
      select: { id: true },
    });

    if (jaTemDesocupacaoAberta) continue;

    try {

      // Mesmo prazo de 3 dias ÚTEIS do primeiro estágio pro zelador
      // executar a missão -- sem responder até lá, o job de status
      // (atualizarStatusVistoriasJob) já vira ATRASADA sozinho.
      const dataProxima = diaUtil.adicionarDiasUteis(new Date(), 3, feriadosSet);

      const vistoria = await vistoriaService.criar({
        titulo: corteVistoriaService.TITULO_FAZER_DESOCUPACAO,
        descricao: `Porta fechada com grade há 2 dias úteis+ e a cobrança de ${inquilino?.nome || 'inquilino'} (R$ ${Number(receita.valor).toFixed(2)}, venceu em ${new Date(receita.vencimento).toLocaleDateString('pt-BR')}) continua sem quitação. Conforme o contrato, o imóvel deve ser desocupado.`,
        unidadeId: unidade.id,
        kitnetId: kitnet.id,
        categoria: 'Cobrança',
        criticidade: 'Crítica',
        periodicidade: 'Única',
        responsavel,
        status: 'PENDENTE',
        data: new Date(),
        dataProxima,
      });

      await prisma.receita.update({
        where: { id: receita.id },
        data: { vistoriaEsvaziarCriadaEm: new Date(), vistoriaEsvaziarId: vistoria.id },
      });

      criadas++;

    } catch (erro) {

      console.error(`[JOB] Erro ao criar vistoria de desocupação de imóvel da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${criadas} vistoria(s) de "desocupação de imóvel" criada(s).`);

};
