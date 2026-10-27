const cron = require("node-cron");

const verificarVencimentos = require("./verificarVencimentosJob");
const verificarContratos = require("./verificarContratosJob");
const verificarCobrancas = require("./verificarCobrancasJob");
const verificarNotificacoes = require("./verificarNotificacoesJob");
const gerarCobrancasRecorrentes = require("./gerarCobrancasRecorrentesJob");
const gerarRecorrenciaReceitas = require("./gerarRecorrenciaReceitasJob");
const lembreteVencimento = require("./lembreteVencimentoJob");
const notificarVencimentoContrato = require("./notificarVencimentoContratoJob");
const cobrancaVencidaWhatsapp = require("./cobrancaVencidaWhatsappJob");
const verificarKitnetsVazias = require("./verificarKitnetsVaziasJob");
const verificarSolicitacoesAtrasadas = require("./verificarSolicitacoesAtrasadasJob");
const verificarVistoriasAtrasadas = require("./verificarVistoriasAtrasadasJob");
const atualizarStatusVistorias = require("./atualizarStatusVistoriasJob");
const lembrarVistoriasPendentes = require("./lembrarVistoriasPendentesJob");
const fecharChamadosResolvidos = require("./fecharChamadosResolvidosJob");
const snapshotOcupacao = require("./snapshotOcupacaoJob");

const iniciarJobs = () => {

  // Status (Programada -> Pendente -> Atrasada) depende de estar perto
  // ou ter passado do prazo na hora certa -- de hora em hora é fino o
  // bastante pra uma janela de 72h, sem precisar rodar o resto dos jobs
  // (notificações, cobranças...) nesse ritmo também. Fechar chamado
  // resolvido há 24h é a mesma ideia (24h é uma janela fina, uma vez
  // por dia deixaria passar de 24h até 48h).
  cron.schedule("0 * * * *", atualizarStatusVistorias);
  cron.schedule("0 * * * *", fecharChamadosResolvidos);

  cron.schedule("0 8 * * *", async () => {

    console.log("========== JOBS ==========");

    await verificarVencimentos();

    // depois de virar PENDENTE -> ATRASADA acima, avisa o inquilino
    await cobrancaVencidaWhatsapp();

    await verificarContratos();

    await notificarVencimentoContrato();

    await verificarCobrancas();

    await verificarNotificacoes();

    // gera a cobrança do mês antes de disparar lembretes, para que uma
    // cobrança recém-criada com vencimento hoje já entre no lembrete
    await gerarCobrancasRecorrentes();

    await gerarRecorrenciaReceitas();

    await lembreteVencimento();

    await verificarKitnetsVazias();

    await verificarSolicitacoesAtrasadas();

    await lembrarVistoriasPendentes();

    await verificarVistoriasAtrasadas();

    await snapshotOcupacao();

    console.log("==========================");

  });

};

module.exports = iniciarJobs;