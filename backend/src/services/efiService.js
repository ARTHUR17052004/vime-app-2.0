const prisma = require('../config/prisma');
const notificacaoService = require('./notificacaoService');
const whatsappAutomacaoService = require('./whatsappAutomacaoService');
const { emitirAtualizacao } = require('../socket');
const { daReceita: locadorDaReceita } = require('../utils/locadorDeRegistro');

// Mesmo papel do bbService.sincronizar/asaasService (ver comentário em
// cada um) -- a EFI ainda não tem webhook nenhum configurado neste
// sistema, então por enquanto só o job de consulta periódica
// (verificarEfiJob.js) chama isto. Mantido como service separado (em
// vez de inline no job) pra, quando um webhook da EFI for implementado,
// reaproveitar esta mesma função sem duplicar a lógica de marcar como
// paga.
const sincronizar = async ({ chargeId, pago }) => {

  if (!pago) {
    return { success: true, mensagem: 'Cobrança ainda não paga, sem ação.' };
  }

  const receita = await prisma.receita.findFirst({
    where: { gatewayProvider: 'EFI', gatewayReferencia: String(chargeId) },
    include: {
      inquilino: true,
      contrato: { include: { inquilino: true } },
    },
  });

  if (!receita) {
    console.error('EFI: nenhuma Receita com gatewayReferencia =', chargeId);
    return { success: false, mensagem: 'Receita não encontrada para essa cobrança.' };
  }

  if (receita.status === 'PAGA') {
    return { success: true, mensagem: 'Receita já estava paga.' };
  }

  const atualizada = await prisma.receita.update({
    where: { id: receita.id },
    data: {
      status: 'PAGA',
      dataPagamento: new Date(),
      confirmacaoPagtoEnviadaEm: new Date(),
    },
  });

  const nomeInquilino = receita.inquilino?.nome || receita.contrato?.inquilino?.nome || '';

  await notificacaoService.criar({
    origem: 'SISTEMA',
    titulo: 'Cobrança paga',
    mensagem: await notificacaoService.renderizarMensagem(
      'COBRANCA_PAGA',
      { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor, banco: 'EFÍ' },
      `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ''} — R$ ${receita.valor} foi confirmado como pago na EFÍ.`
    ),
    link: '/financeiro',
    locadorId: await locadorDaReceita(receita.id),
  });

  const inquilino = receita.inquilino || receita.contrato?.inquilino;

  if (inquilino) {
    whatsappAutomacaoService
      .notificarPagamentoConfirmado(atualizada, inquilino)
      .catch((erro) => console.error('[WhatsApp] pagamento_confirmado (EFI):', erro.message));
  }

  emitirAtualizacao('receita');

  return { success: true, mensagem: 'Receita marcada como paga.' };

};

module.exports = {
  sincronizar,
};
