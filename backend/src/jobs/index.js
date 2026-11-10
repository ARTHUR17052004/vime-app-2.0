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
const verificarBoletosBB = require("./verificarBoletosBBJob");
const verificarAsaas = require("./verificarAsaasJob");
const verificarAtrasoCorte = require("./verificarAtrasoCorteJob");

const iniciarJobs = () => {

  // Status (Programada -> Pendente -> Atrasada) depende de estar perto
  // ou ter passado do prazo na hora certa -- de hora em hora é fino o
  // bastante pra uma janela de 72h, sem precisar rodar o resto dos jobs
  // (notificações, cobranças...) nesse ritmo também. Fechar chamado
  // resolvido há 24h é a mesma ideia (24h é uma janela fina, uma vez
  // por dia deixaria passar de 24h até 48h).
  cron.schedule("0 * * * *", atualizarStatusVistorias);
  cron.schedule("0 * * * *", fecharChamadosResolvidos);

  // Mesma lógica das duas de cima (janela fina de 72h, não pode
  // esperar o lote diário das 8h) -- ver verificarAtrasoCorteJob.js.
  cron.schedule("0 * * * *", verificarAtrasoCorte);

  // Não espera o lote diário das 8h -- quem pergunta "foi pago?" quer
  // saber na hora, não no dia seguinte. O webhook do BB existe mas
  // nunca foi confirmado ao vivo, então isso é o que garante de verdade
  // que o sistema reconhece o pagamento sem depender dele disparar certo.
  cron.schedule("*/15 * * * *", verificarBoletosBB);

  // Mesmo motivo do job do BB acima: a Asaas também tem webhook, mas ele
  // às vezes some sozinho (a Asaas pausa um webhook depois de falhas
  // repetidas de entrega, sem avisar ninguém) -- isso já fez o sistema
  // cobrar gente que já tinha pago (ver verificarAsaasJob.js).
  cron.schedule("*/15 * * * *", verificarAsaas);

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