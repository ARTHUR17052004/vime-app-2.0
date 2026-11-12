const prisma = require("../config/prisma");
const { gerarCobrancaParaContrato } = require("../services/cobrancaRecorrenteService");
const notificacaoService = require("../services/notificacaoService");

/*
  Emissão mensal de cobrança de aluguel (dia 20).

  Para cada Contrato ATIVO, garante que exista a Receita (cobrança de
  aluguel) do mês SEGUINTE -- mas só gera uma nova se a última cobrança
  já estiver PAGA. Se a última ainda estiver pendente/atrasada, não cria
  outra (evita empilhar dívida em vez de cobrar a que já existe) --
  pedido explícito do usuário.

  Cada residência (Unidade) pode ter uma "Data de Início da Cobrança"
  (`dataInicioCobranca`); contratos de residências com essa data no
  futuro ainda não entram no job. Sem data definida, sempre valeu (não
  trava nada -- comportamento anterior).

  A lógica de cada contrato individual mora em cobrancaRecorrenteService.

  Importante: este job NÃO envia a cobrança ao banco -- quem faz isso é
  o dispararReceitasBancoJob, todo dia 01, depois da equipe ter a janela
  de ~10 dias pra revisar o que foi emitido aqui.
*/

module.exports = async () => {
  console.log("[JOB] Gerando cobranças recorrentes (emissão do dia 20)...");

  const contratos = await prisma.contrato.findMany({
    where: { status: "ATIVO" },
    include: { unidade: true },
  });

  let criadas = 0;
  let existentes = 0;
  let aguardandoPagamento = 0;
  let aindaNaoIniciou = 0;
  let contratoEncerraAntes = 0;

  // Conta quantas receitas foram criadas por locador, pra avisar cada
  // um só sobre as suas (ver notificacaoService.criar -- locadorId
  // escopa quem recebe).
  const criadasPorLocador = new Map();

  for (const contrato of contratos) {

    const resultado = await gerarCobrancaParaContrato(contrato);

    if (resultado.criada) {
      criadas++;
      const chave = contrato.locadorId || "SEM_LOCADOR";
      criadasPorLocador.set(chave, (criadasPorLocador.get(chave) || 0) + 1);
    } else if (resultado.motivo === "aindaNaoIniciou") {
      aindaNaoIniciou++;
    } else if (resultado.motivo === "jaExiste") {
      existentes++;
    } else if (resultado.motivo === "contratoEncerraAntes") {
      contratoEncerraAntes++;
    } else {
      aguardandoPagamento++;
    }

  }

  for (const [locadorId, quantidade] of criadasPorLocador.entries()) {

    if (locadorId === "SEM_LOCADOR") continue;

    try {

      await notificacaoService.criar({
        origem: "SISTEMA",
        titulo: "RECEITAS EMITIDAS",
        mensagem: await notificacaoService.renderizarMensagem(
          "RECEITAS_EMITIDAS",
          { quantidade: String(quantidade) },
          `${quantidade} receita(s) de aluguel do mês que vem foram emitidas (Pendente, ainda não enviadas ao banco). Confira o Financeiro -- o disparo automático ao banco acontece no dia 01.`
        ),
        link: "/financeiro",
        locadorId,
      });

    } catch (erro) {
      console.error(`[JOB] Erro ao notificar locador ${locadorId} sobre receitas emitidas:`, erro.message);
    }

  }

  console.log(
    `[JOB] Cobranças recorrentes: ${criadas} criadas, ${existentes} já existiam, ${aguardandoPagamento} aguardando pagamento da anterior, ${aindaNaoIniciou} ainda não iniciaram cobrança, ${contratoEncerraAntes} com contrato terminando antes do próximo vencimento (${contratos.length} contratos ativos).`
  );

  return { criadas, existentes, aguardandoPagamento, aindaNaoIniciou, contratoEncerraAntes, total: contratos.length };
};
