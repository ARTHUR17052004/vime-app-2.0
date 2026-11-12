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
const verificarEfi = require("./verificarEfiJob");
const verificarAtrasoCorte = require("./verificarAtrasoCorteJob");
const verificarCobrancaNaoEnviada = require("./verificarCobrancaNaoEnviadaJob");
const dispararReceitasBanco = require("./dispararReceitasBancoJob");
const avisoDisparoReceitas = require("./avisoDisparoReceitasJob");

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

  // A EFI nem webhook tem configurado ainda -- sem isso, uma cobrança
  // paga na EFI nunca seria reconhecida sozinha (ver verificarEfiJob.js).
  cron.schedule("*/15 * * * *", verificarEfi);

  // Emissão mensal de Aluguel: dia 20 só CRIA a receita do mês seguinte
  // (Pendente, sem enviar ao banco) -- dá a janela de ~10 dias pra
  // equipe revisar antes do disparo de verdade. Ver
  // gerarCobrancasRecorrentesJob.js / dispararReceitasBancoJob.js.
  // Roda 1h antes do lote diário das 8h (nunca ao mesmo tempo) só pra
  // nunca correr em paralelo com ele -- sem depender de nenhum dos dois
  // de verdade.
  cron.schedule("0 7 20 * *", gerarCobrancasRecorrentes);

  // Disparo automático ao banco: dia 01, depois da janela de revisão.
  cron.schedule("0 7 1 * *", dispararReceitasBanco);

  cron.schedule("0 8 * * *", async () => {

    console.log("========== JOBS ==========");

    await gerarRecorrenciaReceitas();

    await verificarVencimentos();

    // depois de virar PENDENTE -> ATRASADA acima, avisa o inquilino
    await cobrancaVencidaWhatsapp();

    await verificarContratos();

    await notificarVencimentoContrato();

    await verificarCobrancas();

    await verificarNotificacoes();

    await lembreteVencimento();

    // Mesmo motivo/mesma janela do lembrete acima, mas pra equipe (não
    // pro inquilino): cobrança perto de vencer (ou já vencida) que
    // nunca foi enviada a banco nenhum -- ver verificarCobrancaNaoEnviadaJob.js.
    await verificarCobrancaNaoEnviada();

    // Lembrete de 5 dias / 24h antes do disparo automático do dia 01
    // (ver dispararReceitasBancoJob.js) -- roda todo dia, só age nos
    // dois marcos certos.
    await avisoDisparoReceitas();

    await verificarKitnetsVazias();

    await verificarSolicitacoesAtrasadas();

    await lembrarVistoriasPendentes();

    await verificarVistoriasAtrasadas();

    await snapshotOcupacao();

    console.log("==========================");

  });

};

module.exports = iniciarJobs;