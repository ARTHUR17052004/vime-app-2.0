const webpush = require("web-push");
const prisma = require("../config/prisma");

// .trim() porque um "\r" sobrando (arquivo .env editado no Windows, por
// exemplo) já é o bastante pra invalidar a chave e derrubar isso aqui.
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY?.trim();
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY?.trim();
const VAPID_SUBJECT = process.env.VAPID_SUBJECT?.trim();

// Sem as 3 chaves configuradas (ou com alguma inválida), o serviço só
// ignora em silêncio -- nunca pode derrubar o resto do app por causa
// disso. Notificação continua indo pro sino/socket normalmente, só a de
// celular que não sai.
let configurado = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);

if (configurado) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (erro) {
    configurado = false;
    console.error("[push] Chave VAPID inválida, notificação no celular desligada:", erro.message);
  }
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

// Aviso geral: vai pra quem vê o sistema inteiro e, se o aviso é de um
// locador, também pros usuários restritos a ele -- nunca pra outro locador.
const enviarParaTodos = async (payload, locadorId = null) => {
  const subscricoes = await prisma.pushSubscription.findMany({
    where: {
      usuario: locadorId
        ? { OR: [{ locadorId: null }, { locadorId }] }
        : { locadorId: null },
    },
  });
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
