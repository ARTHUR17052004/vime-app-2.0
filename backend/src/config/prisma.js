const { PrismaClient } = require('@prisma/client');

const base = new PrismaClient();

// O Neon (Postgres serverless) fecha conexões ociosas por conta própria
// -- o Prisma só percebe na hora de usar de novo, e a query falha com
// "Server has closed the connection" (P1017) mesmo com o banco saudável.
// Sem isso, qualquer tela virava um "Failed to fetch" aleatório pro
// usuário só porque a conexão tinha acabado de cair. Tenta de novo
// algumas vezes (com um respiro crescente) antes de desistir de verdade.
const comRetryDeConexao = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {

        const tentativas = 3;

        for (let tentativa = 1; tentativa <= tentativas; tentativa++) {

          try {
            return await query(args);
          } catch (erro) {

            const conexaoCaiu =
              erro?.code === 'P1017' ||
              /Server has closed the connection|Connection terminated|ECONNRESET/i.test(erro?.message || '');

            if (!conexaoCaiu || tentativa === tentativas) {
              throw erro;
            }

            await new Promise((resolve) => setTimeout(resolve, 200 * tentativa));

          }

        }

      },
    },
  },
});

// Mantém kitnet.vazioDesde sincronizado com o status sozinho, não
// importa por qual service o status é trocado (contratoService,
// inquilinoService, kitnetService, verificarContratosJob...): sempre
// que o status entra em DISPONIVEL, marca "vazia desde agora"; sempre
// que sai de DISPONIVEL (locada ou em manutenção), zera. O alerta de
// 72h+ (verificarKitnetsVaziasJob.js) lê só esse campo.
const prisma = comRetryDeConexao.$extends({
  query: {
    kitnet: {

      async create({ args, query }) {

        if (!args.data || args.data.status === undefined || args.data.status === 'DISPONIVEL') {
          args.data = { ...args.data, vazioDesde: new Date() };
        }

        return query(args);

      },

      async createMany({ args, query }) {

        const agora = new Date();
        const lista = Array.isArray(args.data) ? args.data : [args.data];

        args.data = lista.map((item) =>
          (item.status === undefined || item.status === 'DISPONIVEL')
            ? { ...item, vazioDesde: agora }
            : item
        );

        return query(args);

      },

      async update({ args, query }) {

        if (args.data && typeof args.data.status !== 'undefined' && args.where?.id) {

          const atual = await comRetryDeConexao.kitnet.findUnique({
            where: { id: args.where.id },
            select: { status: true },
          });

          if (args.data.status === 'DISPONIVEL' && atual?.status !== 'DISPONIVEL') {
            args.data.vazioDesde = new Date();
            args.data.ultimoAlertaVaziaEm = null;
          } else if (args.data.status !== 'DISPONIVEL' && atual?.status === 'DISPONIVEL') {
            args.data.vazioDesde = null;
            args.data.ultimoAlertaVaziaEm = null;

            // Kitnet estava vazia e voltou a ficar ocupada/manutenção --
            // cancela a vistoria de entrega automática se ainda não foi
            // Realizada, senão fica presa aberta pra sempre. Require
            // tardio (dentro da função) pra evitar ciclo: kitnetOcupacao
            // usa este próprio arquivo (module.exports de prisma).
            const { cancelarVistoriaDeEntrega } = require('../utils/kitnetOcupacao');
            cancelarVistoriaDeEntrega(args.where.id);
          }

        }

        return query(args);

      },

    },
  },
});

module.exports = prisma;
