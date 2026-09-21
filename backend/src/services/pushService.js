const webpush = require("web-push");
const prisma = require("../config/prisma");

// Sem as 3 chaves configuradas, o serviço só ignora em silêncio (não
// derruba o resto do app -- notificação continua indo pro sino/socket
// normalmente, só a de celular que não sai).
const configurado = Boolean(
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
);

if (configurado) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const chavePublica = () => process.env.VAPID_PUBLIC_KEY || null;

// `subscription` é o objeto que o navegador devolve de
// PushManager.subscribe() -- { endpoint, keys: { p256dh, auth } }.
const salvarSubscricao = async (usuarioId, subscription) => {

  const { endpoint, keys } = subscription;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Inscrição de push inválida.");
  }

  return prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { usuarioId, p256dh: keys.p256dh, auth: keys.auth },
    create: { usuarioId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });

};

const removerSubscricao = async (endpoint) => {
  return prisma.pushSubscription.deleteMany({ where: { endpoint } });
};

// Manda pra uma lista de inscrições e apaga do banco qualquer uma que
// o navegador já invalidou (410 Gone / 404) -- senão o mesmo endpoint
// morto fica sendo tentado pra sempre.
const enviarParaSubscricoes = async (subscricoes, payload) => {

  if (!configurado || subscricoes.length === 0) return;

  const corpo = JSON.stringify(payload);

  await Promise.all(subscricoes.map(async (sub) => {

    try {

      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        corpo
      );

    } catch (erro) {

      if (erro.statusCode === 404 || erro.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        console.error("[push] Falha ao enviar:", erro.message);
      }

    }

  }));

};

const contarSubscricoes = (usuarioId) => prisma.pushSubscription.count({ where: { usuarioId } });

const enviarPara = async (usuarioId, payload) => {
  const subscricoes = await prisma.pushSubscription.findMany({ where: { usuarioId } });
  await enviarParaSubscricoes(subscricoes, payload);
};

const enviarParaTodos = async (payload) => {
  const subscricoes = await prisma.pushSubscription.findMany();
  await enviarParaSubscricoes(subscricoes, payload);
};

module.exports = {
  configurado,
  chavePublica,
  salvarSubscricao,
  removerSubscricao,
  enviarPara,
  contarSubscricoes,
  enviarParaTodos,
};
