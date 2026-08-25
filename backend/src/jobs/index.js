const cron = require("node-cron");

const verificarVencimentos = require("./verificarVencimentosJob");
const verificarContratos = require("./verificarContratosJob");
const verificarCobrancas = require("./verificarCobrancasJob");
const verificarNotificacoes = require("./verificarNotificacoesJob");
const gerarCobrancasRecorrentes = require("./gerarCobrancasRecorrentesJob");
const lembreteVencimento = require("./lembreteVencimentoJob");
const notificarVencimentoContrato = require("./notificarVencimentoContratoJob");

const iniciarJobs = () => {

  cron.schedule("0 8 * * *", async () => {

    console.log("========== JOBS ==========");

    await verificarVencimentos();

    await verificarContratos();

    await notificarVencimentoContrato();

    await verificarCobrancas();

    await verificarNotificacoes();

    // gera a cobrança do mês antes de disparar lembretes, para que uma
    // cobrança recém-criada com vencimento hoje já entre no lembrete
    await gerarCobrancasRecorrentes();

    await lembreteVencimento();

    console.log("==========================");

  });

};

module.exports = iniciarJobs;