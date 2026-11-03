const prisma = require('../config/prisma');
const BBApi = require('../services/BBApi');
const bbService = require('../services/bbService');
const { numeroControleParaReceita } = require('../utils/numeroControleBB');

/*
  O BB tem webhook (bbController.webhook -> bbService.sincronizar), mas
  o formato exato do payload que ele manda nunca foi confirmado ao vivo
  -- rodar só de madrugada (job das 8h) também não serve pra quem
  precisa saber "na hora" se um boleto foi pago. Esse job pergunta
  direto pra API do BB (GET /cobrancas/v2/boletos/{...}, já confirmado
  ao vivo em 03/11/2026 contra um boleto pago de verdade:
  codigoEstadoTituloCobranca = 6 quando liquidado) -- não depende do
  webhook disparar certo, só precisa que o BB responda a consulta.

  Alimenta o MESMO bbService.sincronizar() que o webhook usaria, então
  qualquer boleto pago aqui já dispara WhatsApp/sino/socket igual o
  webhook dispararia -- sem duplicar lógica nenhuma.
*/
module.exports = async () => {

  const receitas = await prisma.receita.findMany({
    where: {
      gatewayProvider: 'BB',
      status: { in: ['PENDENTE', 'ATRASADA'] },
      gatewayReferencia: { not: null },
    },
    include: { contaPagamento: true },
  });

  if (receitas.length === 0) return;

  console.log(`[JOB] Conferindo ${receitas.length} boleto(s) do BB direto na API...`);

  let pagos = 0;

  for (const receita of receitas) {

    try {

      const numeroControle = numeroControleParaReceita(receita.id);

      const resultado = await BBApi.consultarBoleto(numeroControle, receita.contaPagamento?.credenciais);

      // A consulta não devolve o número que a gente mandou (só dados do
      // título) -- usa o gatewayReferencia já salvo pra achar a Receita
      // certa dentro de sincronizar(), igual o webhook faria.
      const resposta = await bbService.sincronizar({
        ...resultado,
        numero: receita.gatewayReferencia,
      });

      if (resposta?.mensagem === 'Receita marcada como paga.') {
        pagos += 1;
      }

    } catch (erro) {

      console.error(`[JOB] Erro ao consultar boleto BB da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${pagos} boleto(s) do BB reconhecido(s) como pago(s) agora.`);

};
