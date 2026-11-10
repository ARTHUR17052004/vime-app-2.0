const prisma = require('../config/prisma');
const AsaasApi = require('../services/AsaasApi');
const asaasService = require('../services/asaasService');

/*
  A Asaas também tem webhook (asaasController.webhook -> asaasService.sincronizar),
  mas ele depende de UMA configuração própria por conta Asaas (cada
  "Conta" cadastrada em Contas tem a sua -- ver registrarWebhookConta em
  asaasService.js) e a Asaas PAUSA sozinha ("interrupted": true) um
  webhook depois de falhas repetidas de entrega, sem avisar ninguém no
  VIME. Foi exatamente isso que aconteceu com a conta ASAAS - ARA em
  10/11/2026: 11 cobranças já pagas (algumas há 5 dias) continuaram
  aparecendo como pendente/atrasada no sistema, e o aviso automático de
  cobrança vencida quase mandou mensagem pra quem já tinha pago.

  Esse job pergunta direto pra API da Asaas (GET /payments/{id}) pra
  cada cobrança ainda aberta -- não depende do webhook disparar certo,
  só precisa que a Asaas responda a consulta. Alimenta o MESMO
  asaasService.sincronizar() que o webhook usaria, então qualquer
  pagamento reconhecido aqui já dispara WhatsApp/sino/socket igual o
  webhook dispararia, sem duplicar lógica nenhuma (mesma estratégia do
  verificarBoletosBBJob.js).
*/
module.exports = async () => {

  const receitas = await prisma.receita.findMany({
    where: {
      gatewayProvider: 'ASAAS',
      status: { in: ['PENDENTE', 'ATRASADA', 'EM_ABERTO'] },
      gatewayReferencia: { not: null },
    },
    include: { contaPagamento: true },
  });

  if (receitas.length === 0) return;

  console.log(`[JOB] Conferindo ${receitas.length} cobrança(s) da Asaas direto na API...`);

  let pagos = 0;

  for (const receita of receitas) {

    try {

      const cred = receita.contaPagamento?.credenciais || {};
      const override = cred.apiKey
        ? { apiKey: cred.apiKey, walletId: cred.walletId || undefined }
        : null;

      const pagamento = await AsaasApi.request('GET', `/payments/${receita.gatewayReferencia}`, null, override);

      let eventoNome = null;

      if (pagamento.status === 'RECEIVED' || pagamento.status === 'CONFIRMED') {
        eventoNome = 'PAYMENT_RECEIVED';
      } else if (pagamento.status === 'OVERDUE') {
        eventoNome = 'PAYMENT_OVERDUE';
      }

      // Ainda PENDING (ou outro status intermediário) -- nada mudou,
      // não tem evento nenhum pra sincronizar() processar.
      if (!eventoNome) continue;

      const resposta = await asaasService.sincronizar({
        event: eventoNome,
        // externalReference já deveria ser o id da receita (é assim que
        // criamos a cobrança), mas garante direto -- sincronizar() só
        // sabe achar a Receita certa por esse campo.
        payment: { ...pagamento, externalReference: receita.id },
      });

      if (resposta?.success && eventoNome === 'PAYMENT_RECEIVED') {
        pagos += 1;
      }

    } catch (erro) {

      console.error(`[JOB] Erro ao consultar cobrança Asaas da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${pagos} cobrança(s) da Asaas reconhecida(s) como paga(s) agora.`);

};
