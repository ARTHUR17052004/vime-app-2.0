const cron = require("node-cron");

const verificarVencimentos = require("./verificarVencimentosJob");
const verificarContratos = require("./verificarContratosJob");
const verificarCobrancas = require("./verificarCobrancasJob");
const verificarNotificacoes = require("./verificarNotificacoesJob");

const iniciarJobs = () => {

  cron.schedule("0 8 * * *", async () => {

    console.log("========== JOBS ==========");

    await verificarVencimentos();

    await verificarContratos();

    await verificarCobrancas();

    await verificarNotificacoes();

    console.log("==========================");

  });

};

module.exports = iniciarJobs;