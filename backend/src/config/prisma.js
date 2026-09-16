const { PrismaClient } = require('@prisma/client');

const base = new PrismaClient();

// Mantém kitnet.vazioDesde sincronizado com o status sozinho, não
// importa por qual service o status é trocado (contratoService,
// inquilinoService, kitnetService, verificarContratosJob...): sempre
// que o status entra em DISPONIVEL, marca "vazia desde agora"; sempre
// que sai de DISPONIVEL (locada ou em manutenção), zera. O alerta de
// 72h+ (verificarKitnetsVaziasJob.js) lê só esse campo.
const prisma = base.$extends({
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

          const atual = await base.kitnet.findUnique({
            where: { id: args.where.id },
            select: { status: true },
          });

          if (args.data.status === 'DISPONIVEL' && atual?.status !== 'DISPONIVEL') {
            args.data.vazioDesde = new Date();
            args.data.ultimoAlertaVaziaEm = null;
          } else if (args.data.status !== 'DISPONIVEL' && atual?.status === 'DISPONIVEL') {
            args.data.vazioDesde = null;
            args.data.ultimoAlertaVaziaEm = null;
          }

        }

        return query(args);

      },

    },
  },
});

module.exports = prisma;
