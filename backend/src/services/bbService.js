const prisma = require('../config/prisma');
const notificacaoService = require('./notificacaoService');
const whatsappAutomacaoService = require('./whatsappAutomacaoService');
const { emitirAtualizacao } = require('../socket');
const { daReceita: locadorDaReceita } = require('../utils/locadorDeRegistro');

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
// codigoEstadoTituloCobranca = 6 (LIQUIDADO) CONFIRMADO ao vivo em
// 03/11/2026 contra um boleto pago de verdade (consulta direta, ver
// jobs/verificarBoletosBBJob.js).
const SITUACOES_PAGO = ['LIQUIDADO', 'PAGO', '6', 'BAIXA OPERACIONAL', 'BAIXA_OPERACIONAL'];

// "DD.MM.YYYY" (formato que o BB usa em tudo) -- a GET de consulta
// manda isso, CONFIRMADO ao vivo em 03/11/2026 (dataRecebimentoTitulo
// e dataCreditoLiquidacao). O webhook de verdade nunca foi confirmado,
// pode mandar outro formato -- por isso sempre com fallback pra "agora".
function paraData(valor) {

  if (!valor || typeof valor !== "string") return null;

  const match = valor.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) return null;

  const [, dia, mes, ano] = match;

  return new Date(`${ano}-${mes}-${dia}T12:00:00`);

}

// dataPagamento = quando o inquilino pagou; dataCredito = quando o
// dinheiro cai de verdade na conta do locador -- o BB separa os dois
// (boleto não compensa sempre no mesmo dia), por isso dois campos.
const extrairDataPagamento = (payload) => {
  return (
    paraData(payload?.dataRecebimentoTitulo) ||
    paraData(payload?.dataPagamento) ||
    new Date()
  );
};

const extrairDataCredito = (payload) => {
  return (
    paraData(payload?.dataCreditoLiquidacao) ||
    paraData(payload?.dataCredito) ||
    null
  );
};

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

    const atualizada = await prisma.receita.update({
      where: { id: receita.id },
      data: {
        status: 'PAGA',
        dataPagamento: extrairDataPagamento(payload),
        dataCredito: extrairDataCredito(payload),
        confirmacaoPagtoEnviadaEm: new Date(),
      },
    });

    const nomeInquilino = receita.inquilino?.nome || receita.contrato?.inquilino?.nome || '';

    await notificacaoService.criar({
      origem: 'SISTEMA',
      titulo: 'Cobrança paga',
      mensagem: await notificacaoService.renderizarMensagem(
        'COBRANCA_PAGA',
        { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor, banco: 'Banco do Brasil' },
        `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ''} — R$ ${receita.valor} foi confirmado como pago no Banco do Brasil.`
      ),
      link: '/financeiro',
      locadorId: await locadorDaReceita(receita.id),
    });

    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (inquilino) {
      whatsappAutomacaoService
        .notificarPagamentoConfirmado(atualizada, inquilino)
        .catch((erro) => console.error('[WhatsApp] pagamento_confirmado (BB):', erro.message));
    }

    emitirAtualizacao('receita');

  }

  return { success: true, mensagem: 'Receita marcada como paga.' };

};

module.exports = {
  sincronizar,
};
