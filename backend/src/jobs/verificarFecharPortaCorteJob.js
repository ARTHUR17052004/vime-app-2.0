const prisma = require('../config/prisma');
const vistoriaService = require('../services/vistoriaService');
const corteVistoriaService = require('../services/corteVistoriaService');
const diaUtil = require('../utils/diaUtil');

/*
  Etapa do MEIO da escalada de corte de água/energia (pedido do usuário
  em 27/11/2026, inserida entre as duas que já existiam) --
  verificarAtrasoCorteJob.js cuida do primeiro estágio (atraso 3 dias
  úteis -> vistoria "REALIZAR CORTE DE ÁGUA E ENERGIA"). Esse aqui cuida
  do segundo: a vistoria de corte foi Realizada mas a cobrança continua
  sem resolver por mais 2 dias úteis -> dispara a vistoria "FECHAR
  PORTA COM GRADE". verificarEscalonamentoCorteJob.js (o antigo
  "segundo estágio") agora é o terceiro, disparado a partir de
  portaFechadaEm em vez de corteRealizadoEm diretamente.

  "2 dias úteis depois do corte realizado" = corteRealizadoEm + 2 dias
  ÚTEIS (mesma régua de dias úteis dos outros estágios).
  vistoriaPortaCriadaEm evita criar duas vezes pra mesma Receita.
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

  // Pré-filtro solto (48h corridas = 2 dias corridos) -- igual aos
  // outros jobs da escalada, a conta exata de 2 dias ÚTEIS é feita
  // depois com diaUtil.
  const limite = new Date(agora);
  limite.setHours(limite.getHours() - 48);

  const candidatas = await prisma.receita.findMany({
    where: {
      corteRealizadoEm: { not: null, lte: limite },
      vistoriaPortaId: null,
      status: { notIn: ['PAGA', 'PAGO', 'CANCELADA'] },
      gatewayReferencia: { not: null },
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
    (receita) => diaUtil.adicionarDiasUteis(new Date(receita.corteRealizadoEm), 2, feriadosSet) <= agora
  );

  if (receitas.length === 0) return;

  console.log(`[JOB] Criando vistoria de "fechar porta com grade" pra ${receitas.length} cobrança(s) com corte realizado há 2 dias úteis+ sem quitação...`);

  const responsavel = await resolverResponsavelZelador();

  let criadas = 0;

  for (const receita of receitas) {

    const kitnet = receita.contrato?.kitnet || receita.inquilino?.kitnet;
    const unidade = receita.contrato?.unidade || receita.inquilino?.kitnet?.unidade;
    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (!kitnet || !unidade) continue;

    // Já existe um "fechar porta" aberto pra essa mesma kitnet -- não
    // cria outro, mesma trava dos outros estágios.
    const jaTemPortaAberta = await prisma.vistoria.findFirst({
      where: { kitnetId: kitnet.id, titulo: corteVistoriaService.TITULO_FECHAR_PORTA, status: { notIn: ['CANCELADA', 'REALIZADA'] } },
      select: { id: true },
    });

    if (jaTemPortaAberta) continue;

    try {

      // Mesmo prazo de 3 dias úteis dos outros estágios pro zelador
      // executar a missão -- sem responder até lá, o job de status
      // (atualizarStatusVistoriasJob) já vira ATRASADA sozinho.
      const dataProxima = diaUtil.adicionarDiasUteis(new Date(), 3, feriadosSet);

      const vistoria = await vistoriaService.criar({
        titulo: corteVistoriaService.TITULO_FECHAR_PORTA,
        descricao: `Corte de água/energia realizado há 2 dias úteis+ e a cobrança de ${inquilino?.nome || 'inquilino'} (R$ ${Number(receita.valor).toFixed(2)}, venceu em ${new Date(receita.vencimento).toLocaleDateString('pt-BR')}) continua sem quitação. Conforme o contrato, a porta da kitnet deve ser fechada com grade.`,
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
        data: { vistoriaPortaCriadaEm: new Date(), vistoriaPortaId: vistoria.id },
      });

      criadas++;

    } catch (erro) {

      console.error(`[JOB] Erro ao criar vistoria de "fechar porta com grade" da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${criadas} vistoria(s) de "fechar porta com grade" criada(s).`);

};
