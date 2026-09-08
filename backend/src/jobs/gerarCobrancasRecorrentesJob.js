const prisma = require("../config/prisma");
const { gerarCobrancaParaContrato } = require("../services/cobrancaRecorrenteService");

/*
  Cobrança recorrente automática.

  Para cada Contrato ATIVO, garante que exista uma Receita (cobrança de
  aluguel) para o mês corrente -- mas só gera uma nova se a última
  cobrança já estiver PAGA. Se a última ainda estiver pendente/atrasada,
  não cria outra (evita empilhar dívida em vez de cobrar a que já
  existe) -- pedido explícito do usuário.

  Cada residência (Unidade) pode ter uma "Data de Início da Cobrança"
  (`dataInicioCobranca`); contratos de residências com essa data no
  futuro ainda não entram no job. Sem data definida, sempre valeu (não
  trava nada -- comportamento anterior).

  A lógica de cada contrato individual mora em cobrancaRecorrenteService
  -- reaproveitada também na hora de cadastrar um inquilino com contrato
  automático, pra gerar a 1ª cobrança na hora (sem esperar até amanhã
  8h, quando este job roda de novo).

  Importante: este job NÃO envia a cobrança ao banco automaticamente —
  isso continua sendo uma ação humana deliberada (botão "Enviar ao
  Banco" em outra parte do sistema). Aqui só criamos o registro local.
*/

module.exports = async () => {
  console.log("[JOB] Gerando cobranças recorrentes...");

  const contratos = await prisma.contrato.findMany({
    where: { status: "ATIVO" },
    include: { unidade: true },
  });

  let criadas = 0;
  let existentes = 0;
  let aguardandoPagamento = 0;
  let aindaNaoIniciou = 0;

  for (const contrato of contratos) {

    const resultado = await gerarCobrancaParaContrato(contrato);

    if (resultado.criada) {
      criadas++;
    } else if (resultado.motivo === "aindaNaoIniciou") {
      aindaNaoIniciou++;
    } else if (resultado.motivo === "jaExiste") {
      existentes++;
    } else {
      aguardandoPagamento++;
    }

  }

  console.log(
    `[JOB] Cobranças recorrentes: ${criadas} criadas, ${existentes} já existiam, ${aguardandoPagamento} aguardando pagamento da anterior, ${aindaNaoIniciou} ainda não iniciaram cobrança (${contratos.length} contratos ativos).`
  );

  return { criadas, existentes, aguardandoPagamento, aindaNaoIniciou, total: contratos.length };
};
