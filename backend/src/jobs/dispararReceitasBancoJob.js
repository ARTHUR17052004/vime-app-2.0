const prisma = require("../config/prisma");
const gatewayPagamentoService = require("../services/gatewayPagamentoService");
const notificacaoService = require("../services/notificacaoService");

/*
  Disparo automático ao banco (dia 01).

  Pega toda Receita de Aluguel ligada a um Contrato ATIVO que:
  - está Pendente ou Atrasada (nunca Paga/Cancelada);
  - nunca foi enviada a nenhum banco (gatewayReferencia null);
  - vence até o fim do mês corrente (cobre tanto as emitidas no dia 20
    passado quanto qualquer receita antiga que tenha ficado pra trás
    sem envio).

  E manda cada uma pro banco de verdade, pelo mesmo caminho do botão
  "Enviar ao Banco" (gatewayPagamentoService.enviarCobranca -- resolve
  o provedor certo pela kitnet/locador sozinho, e já notifica o
  inquilino quando dá certo). Essa é a contraparte do
  gerarCobrancasRecorrentesJob (dia 20): lá só cria o registro local,
  aqui é que a cobrança sai do papel de verdade -- depois da janela de
  ~10 dias que a equipe teve pra revisar/editar.

  Erro em uma receita não pode travar as outras -- cada uma é isolada e
  reportada no resumo final (contratoId continua Ativo, mas sem envio;
  fica igual uma "cobrança não enviada" comum, que o
  verificarCobrancaNaoEnviadaJob já cobre separadamente).
*/

module.exports = async () => {
  console.log("[JOB] Disparando receitas ao banco (dia 01)...");

  const inicioDeHoje = new Date();
  inicioDeHoje.setHours(0, 0, 0, 0);

  const fimDoMes = new Date(inicioDeHoje.getFullYear(), inicioDeHoje.getMonth() + 1, 0);
  fimDoMes.setHours(23, 59, 59, 999);

  const receitas = await prisma.receita.findMany({
    where: {
      categoria: "Aluguel",
      contratoId: { not: null },
      status: { in: ["PENDENTE", "ATRASADA"] },
      gatewayReferencia: null,
      vencimento: { lte: fimDoMes },
      contrato: { status: "ATIVO" },
    },
    include: {
      contrato: { select: { locadorId: true } },
    },
  });

  let enviadas = 0;
  let falharam = 0;

  const enviadasPorLocador = new Map();
  const falhasPorLocador = new Map();

  for (const receita of receitas) {

    const locadorId = receita.locadorId || receita.contrato?.locadorId || "SEM_LOCADOR";

    try {

      const resultado = await gatewayPagamentoService.enviarCobranca(receita.id);

      if (resultado.success) {
        enviadas++;
        enviadasPorLocador.set(locadorId, (enviadasPorLocador.get(locadorId) || 0) + 1);
      } else {
        falharam++;
        falhasPorLocador.set(locadorId, (falhasPorLocador.get(locadorId) || 0) + 1);
        console.error(`[JOB] Falha ao disparar receita ${receita.id} ao banco:`, resultado.mensagem);
      }

    } catch (erro) {
      falharam++;
      falhasPorLocador.set(locadorId, (falhasPorLocador.get(locadorId) || 0) + 1);
      console.error(`[JOB] Erro ao disparar receita ${receita.id} ao banco:`, erro.message);
    }

  }

  const locadores = new Set([...enviadasPorLocador.keys(), ...falhasPorLocador.keys()]);

  for (const locadorId of locadores) {

    if (locadorId === "SEM_LOCADOR") continue;

    const qtdEnviadas = enviadasPorLocador.get(locadorId) || 0;
    const qtdFalhas = falhasPorLocador.get(locadorId) || 0;

    try {

      await notificacaoService.criar({
        origem: "SISTEMA",
        titulo: "DISPARO AUTOMATICO DE COBRANCAS",
        mensagem: await notificacaoService.renderizarMensagem(
          "DISPARO_RECEITAS_REALIZADO",
          { enviadas: String(qtdEnviadas), falhas: String(qtdFalhas) },
          qtdFalhas > 0
            ? `${qtdEnviadas} cobrança(s) de aluguel enviada(s) automaticamente aos bancos hoje. ${qtdFalhas} falharam e precisam ser enviadas manualmente -- confira no Financeiro.`
            : `${qtdEnviadas} cobrança(s) de aluguel enviada(s) automaticamente aos bancos hoje.`
        ),
        link: "/financeiro",
        locadorId,
      });

    } catch (erro) {
      console.error(`[JOB] Erro ao notificar locador ${locadorId} sobre disparo de receitas:`, erro.message);
    }

  }

  console.log(
    `[JOB] Disparo de receitas ao banco: ${enviadas} enviada(s), ${falharam} falha(s) (${receitas.length} candidata(s)).`
  );

  return { enviadas, falharam, total: receitas.length };
};
