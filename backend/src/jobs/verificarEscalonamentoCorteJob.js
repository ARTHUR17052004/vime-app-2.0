const prisma = require('../config/prisma');
const vistoriaService = require('../services/vistoriaService');
const corteVistoriaService = require('../services/corteVistoriaService');
const diaUtil = require('../utils/diaUtil');

/*
  Segundo estágio da escalada de corte de água/energia (pedido do
  usuário em 18/11/2026) -- verificarAtrasoCorteJob.js cuida do
  primeiro (atraso 72h+ -> vistoria "REALIZAR CORTE DE ÁGUA E
  ENERGIA"). Esse aqui cuida do segundo: a vistoria de corte foi
  Realizada (ver vistoriaService.atualizar, que grava
  Receita.corteRealizadoEm) mas a cobrança continua sem resolver por
  mais 72h -> dispara a vistoria "ESVAZIAR KITNET", que ao ser
  Realizada encerra o contrato e libera a kitnet sozinha.

  "72h depois do corte realizado" = corteRealizadoEm + 3 dias, mesma
  régua de verificarAtrasoCorteJob.js. vistoriaEsvaziarCriadaEm evita
  criar duas vezes pra mesma Receita.
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

  // Pré-filtro solto (72h corridas) -- igual verificarAtrasoCorteJob.js,
  // a conta exata de 3 dias ÚTEIS é feita depois com diaUtil.
  const limite = new Date(agora);
  limite.setHours(limite.getHours() - 72);

  const candidatas = await prisma.receita.findMany({
    where: {
      corteRealizadoEm: { not: null, lte: limite },
      vistoriaEsvaziarId: null,
      status: { notIn: ['PAGA', 'PAGO', 'CANCELADA'] },
      gatewayReferencia: { not: null },
      // Defesa em profundidade: corteRealizadoEm só devia existir pra
      // Aluguel já (ver verificarAtrasoCorteJob.js), mas confere aqui
      // também -- nunca esvaziar kitnet por causa de Taxa/Multa.
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
    (receita) => diaUtil.adicionarDiasUteis(new Date(receita.corteRealizadoEm), 3, feriadosSet) <= agora
  );

  if (receitas.length === 0) return;

  console.log(`[JOB] Criando vistoria de "esvaziar kitnet" pra ${receitas.length} cobrança(s) com corte realizado há 3 dias úteis+ sem quitação...`);

  const responsavel = await resolverResponsavelZelador();

  let criadas = 0;

  for (const receita of receitas) {

    const kitnet = receita.contrato?.kitnet || receita.inquilino?.kitnet;
    const unidade = receita.contrato?.unidade || receita.inquilino?.kitnet?.unidade;
    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (!kitnet || !unidade) continue;

    // Já existe um "esvaziar kitnet" aberto pra essa mesma kitnet --
    // não cria outro, mesma trava de verificarAtrasoCorteJob.js.
    const jaTemEsvaziarAberto = await prisma.vistoria.findFirst({
      where: { kitnetId: kitnet.id, titulo: corteVistoriaService.TITULO_ESVAZIAR_KITNET, status: { notIn: ['CANCELADA', 'REALIZADA'] } },
      select: { id: true },
    });

    if (jaTemEsvaziarAberto) continue;

    try {

      // Mesmo prazo de 3 dias ÚTEIS do primeiro estágio -- sem
      // responder até lá, o job de status (atualizarStatusVistoriasJob)
      // já vira ATRASADA sozinho.
      const dataProxima = diaUtil.adicionarDiasUteis(new Date(), 3, feriadosSet);

      const vistoria = await vistoriaService.criar({
        titulo: corteVistoriaService.TITULO_ESVAZIAR_KITNET,
        descricao: `Corte de água/energia realizado há 72h+ e a cobrança de ${inquilino?.nome || 'inquilino'} (R$ ${Number(receita.valor).toFixed(2)}, venceu em ${new Date(receita.vencimento).toLocaleDateString('pt-BR')}) continua sem quitação. Conforme o contrato, a kitnet deve ser esvaziada.`,
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

      console.error(`[JOB] Erro ao criar vistoria de esvaziar kitnet da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${criadas} vistoria(s) de "esvaziar kitnet" criada(s).`);

};
