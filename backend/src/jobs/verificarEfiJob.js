const prisma = require('../config/prisma');
const EFIApi = require('../services/EFIApi');
const efiService = require('../services/efiService');

/*
  Mesma ideia de verificarBoletosBBJob.js/verificarAsaasJob.js: a EFI
  não tem nenhum webhook configurado neste sistema ainda, então sem
  isso NENHUMA cobrança da EFI jamais seria reconhecida como paga
  sozinha (ficaria "Em Aberto" pra sempre, mesmo com o inquilino já
  tendo pago) -- exatamente o tipo de falha silenciosa que já aconteceu
  com a Asaas (webhook pausado sozinho) e motivou essa rede de segurança
  em todas as contas.

  ATENÇÃO: EFIApi.consultarCobranca() usa o endpoint/formato mais
  provável da documentação pública da EFI, mas NÃO foi confirmado ao
  vivo ainda (diferente de criarBoleto, que já foi testado contra uma
  cobrança real). Acompanhar o log a primeira vez que uma cobrança EFI
  for paga de verdade, pra confirmar que o status bate.
*/
module.exports = async () => {

  const receitas = await prisma.receita.findMany({
    where: {
      gatewayProvider: 'EFI',
      status: { in: ['PENDENTE', 'ATRASADA', 'EM_ABERTO'] },
      gatewayReferencia: { not: null },
    },
    include: { contaPagamento: true },
  });

  if (receitas.length === 0) return;

  console.log(`[JOB] Conferindo ${receitas.length} cobrança(s) da EFI direto na API...`);

  let pagos = 0;

  for (const receita of receitas) {

    try {

      const resultado = await EFIApi.consultarCobranca(
        receita.gatewayReferencia,
        receita.contaPagamento?.credenciais
      );

      const resposta = await efiService.sincronizar({
        chargeId: receita.gatewayReferencia,
        pago: resultado.pago,
      });

      if (resposta?.mensagem === 'Receita marcada como paga.') {
        pagos += 1;
      }

    } catch (erro) {

      console.error(`[JOB] Erro ao consultar cobrança EFI da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${pagos} cobrança(s) da EFI reconhecida(s) como paga(s) agora.`);

};
