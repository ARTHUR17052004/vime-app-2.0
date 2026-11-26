const relatorioEnvioService = require("../services/relatorioEnvioService");

// Envio agendado de relatório (Relatórios > área de envio, ver
// relatorioEnvioService.js) -- confere a cada 15min se alguma data
// agendada já chegou, nunca espera o lote diário das 8h (o usuário
// escolhe a hora exata que quer que chegue). Mesmo intervalo dos jobs
// de conferir pagamento (verificarBoletosBB/Asaas/Efi).
module.exports = () => relatorioEnvioService.processarPendentes();
