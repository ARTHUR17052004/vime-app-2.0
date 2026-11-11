const prisma = require('../config/prisma');
const notificacaoService = require('../services/notificacaoService');
const { daReceita: locadorDaReceita } = require('../utils/locadorDeRegistro');

/*
  Avisa a EQUIPE (sino + WhatsApp de quem tiver isso ligado -- nunca o
  inquilino) quando uma cobrança está perto de vencer (ou já vencida) e
  NUNCA foi enviada a banco nenhum (gatewayReferencia null) -- ninguém
  pode cobrar o inquilino, nem saber se ele pagou, de um boleto que
  nunca existiu de verdade. Sem isso, essas cobranças ficavam invisíveis
  no meio das outras até alguém notar manualmente (foi o que motivou
  esse job: cobranças com semanas de atraso que nunca tinham sido
  enviadas, e o "risco de corte" contando pra elas igual se tivessem
  sido -- ver verificarAtrasoCorteJob.js, que agora exige envio real).

  "Perto de vencer" = dentro de 3 dias (mesma janela de
  lembreteVencimentoJob.js) -- cobre também quem já venceu (vencimento
  no passado também é "dentro de 3 dias" dessa conta). Um aviso por dia
  enquanto continuar sem ser enviada (não só uma vez pra sempre),
  porque o problema persiste até alguém agir.
*/
const DIAS_JANELA = 3;

module.exports = async () => {

  const inicioDeHoje = new Date();
  inicioDeHoje.setHours(0, 0, 0, 0);

  const limite = new Date(inicioDeHoje);
  limite.setDate(limite.getDate() + DIAS_JANELA);
  limite.setHours(23, 59, 59, 999);

  const receitas = await prisma.receita.findMany({
    where: {
      status: { in: ['PENDENTE', 'ATRASADA'] },
      gatewayReferencia: null,
      vencimento: { lte: limite },
      OR: [
        { alertaNaoEnviadaEm: null },
        { alertaNaoEnviadaEm: { lt: inicioDeHoje } },
      ],
    },
    include: {
      contrato: { include: { inquilino: true, kitnet: true } },
      inquilino: { include: { kitnet: true } },
    },
  });

  if (receitas.length === 0) return;

  console.log(`[JOB] Avisando a equipe sobre ${receitas.length} cobrança(s) perto de vencer (ou vencida) e nunca enviada(s) ao banco...`);

  let avisadas = 0;

  for (const receita of receitas) {

    const inquilino = receita.inquilino || receita.contrato?.inquilino;
    const kitnet = receita.contrato?.kitnet || receita.inquilino?.kitnet;

    const vencida = new Date(receita.vencimento) < inicioDeHoje;

    try {

      await notificacaoService.criar({
        origem: 'SISTEMA',
        titulo: 'COBRANÇA NÃO ENVIADA',
        mensagem: await notificacaoService.renderizarMensagem(
          'COBRANCA_NAO_ENVIADA',
          {
            inquilino: inquilino?.nome || 'inquilino',
            kitnet: kitnet?.numero || kitnet?.nome || '',
            valor: Number(receita.valor).toFixed(2),
            vencimento: new Date(receita.vencimento).toLocaleDateString('pt-BR'),
          },
          `${inquilino?.nome || 'Um inquilino'}${kitnet?.numero ? ` (kitnet ${kitnet.numero})` : ''} -- cobrança de R$ ${Number(receita.valor).toFixed(2)} ${vencida ? 'venceu' : 'vence'} em ${new Date(receita.vencimento).toLocaleDateString('pt-BR')} e ainda não foi enviada a nenhum banco. Envie a cobrança ou regularize antes que o prazo passe.`
        ),
        link: '/financeiro',
        locadorId: await locadorDaReceita(receita.id),
      });

      await prisma.receita.update({
        where: { id: receita.id },
        data: { alertaNaoEnviadaEm: new Date() },
      });

      avisadas++;

    } catch (erro) {

      console.error(`[JOB] Erro ao avisar sobre cobrança não enviada (receita ${receita.id}):`, erro.message);

    }

  }

  console.log(`[JOB] ${avisadas} aviso(s) de cobrança não enviada criado(s).`);

};
