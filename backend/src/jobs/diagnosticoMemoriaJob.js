const prisma = require("../config/prisma");
const { getIO } = require("../socket");

/*
  TEMPORÁRIO -- só pra achar o vazamento de memória que derrubou o
  backend de produção por OOM em 16/11/2026 (ver dmesg: processo
  chegou a 3,37GB numa VPS de 3,8GB sem swap). Loga a cada minuto pra
  comparar o crescimento real (rss/external/arrayBuffers) com o que
  está rodando no momento (conexões socket abertas, handles ativos).
  Remover depois de identificar a causa.
*/
module.exports = async () => {

  const mem = process.memoryUsage();
  const io = getIO();

  const sockets = io ? io.sockets.sockets.size : -1;

  const handles = process._getActiveHandles ? process._getActiveHandles().length : -1;
  const requests = process._getActiveRequests ? process._getActiveRequests().length : -1;

  console.log(
    `[DIAG-MEM] rss=${(mem.rss / 1024 / 1024).toFixed(1)}MB heapUsed=${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB ` +
    `heapTotal=${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB external=${(mem.external / 1024 / 1024).toFixed(1)}MB ` +
    `arrayBuffers=${(mem.arrayBuffers / 1024 / 1024).toFixed(1)}MB sockets=${sockets} handles=${handles} requests=${requests}`
  );

};
