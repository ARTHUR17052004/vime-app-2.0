const prisma = require('../config/prisma');
const notificacaoService = require('./notificacaoService');

// ATENÇÃO: o formato exato do webhook do BB (Cobranças v2) ainda não
// foi confirmado ao vivo -- a documentação oficial só menciona que ele
// existe ("Webhook da Cobrança Bancária... notificações automáticas
// sempre que ocorrerem alterações relevantes"), sem detalhar o
// payload. Este código tenta os nomes de campo mais prováveis
// (baseado no formato de resposta da própria criação de boleto, que
// já testamos ao vivo) e loga o corpo bruto quando não reconhece --
// assim que um pagamento real disparar o primeiro webhook, dá pra
// ajustar rapidinho olhando o log.
const extrairNumeroBoleto = (payload) => {
  return (
    payload?.numero ||
    payload?.numeroTituloCliente ||
    payload?.numeroBoleto ||
    payload?.boleto?.numero ||
    null
  );
};

const extrairSituacao = (payload) => {
  return (
    payload?.situacao ||
    payload?.codigoEstadoTituloCobranca ||
    payload?.estado ||
    payload?.tipoMovimento ||
    ""
  ).toString().toUpperCase();
};

// Situações do BB que significam "pago" -- LIQUIDADO (pago no próprio
// BB) e as variações de baixa operacional (pago em outro banco/canal).
// Ver `codigoEstadoTituloCobranca` na doc oficial (6 = LIQUIDADO).
const SITUACOES_PAGO = ['LIQUIDADO', 'PAGO', '6', 'BAIXA OPERACIONAL', 'BAIXA_OPERACIONAL'];

const sincronizar = async (payload) => {

  if (!payload) {
    return { success: false, mensagem: 'Corpo do webhook vazio.' };
  }

  const numeroBoleto = extrairNumeroBoleto(payload);

  if (!numeroBoleto) {
    console.error('Webhook BB sem número de boleto reconhecido:', JSON.stringify(payload));
    return { success: false, mensagem: 'Número do boleto não encontrado no webhook.' };
  }

  const receita = await prisma.receita.findFirst({
    where: { gatewayReferencia: numeroBoleto },
    include: {
      inquilino: true,
      contrato: { include: { inquilino: true } },
    },
  });

  if (!receita) {
    console.error('Webhook BB: nenhuma Receita com gatewayReferencia =', numeroBoleto);
    return { success: false, mensagem: 'Receita não encontrada para esse boleto.' };
  }

  const situacao = extrairSituacao(payload);
  const pago = SITUACOES_PAGO.includes(situacao);

  if (!pago) {
    // Outros eventos (protesto, alteração, etc.) -- só registra, não
    // muda status ainda. Evita marcar como paga por engano num evento
    // que não é de pagamento.
    return { success: true, mensagem: `Evento recebido (situação: ${situacao || 'desconhecida'}), sem ação.` };
  }

  if (receita.status !== 'PAGA') {

    await prisma.receita.update({
      where: { id: receita.id },
      data: {
        status: 'PAGA',
        dataPagamento: new Date(),
      },
    });

    const nomeInquilino = receita.inquilino?.nome || receita.contrato?.inquilino?.nome || '';

    await notificacaoService.criar({
      origem: 'SISTEMA',
      titulo: 'Cobrança paga',
      mensagem: `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ''} — R$ ${receita.valor} foi confirmado como pago no Banco do Brasil.`,
      link: '/financeiro',
    });

  }

  return { success: true, mensagem: 'Receita marcada como paga.' };

};

module.exports = {
  sincronizar,
};
