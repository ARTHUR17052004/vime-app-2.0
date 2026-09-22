import { PushService } from "../services/push.service";

// Popup do sistema (a "barra" do celular/notificação do Windows) pra
// quem recebeu a notificação pelo socket (app aberto) -- cobre quem
// nunca ativou o push (ex.: navegador de desktop): sem isso, esse
// usuário só teria o sino piscando e o som, nunca um popup de verdade.
//
// Quem já ativou o push (ver AtivarNotificacoesPush.jsx) não passa por
// aqui: o próprio service worker mostra o popup quando o push chega
// (ver public/sw.js) -- mostrar de novo aqui ia duplicar o aviso.
export async function mostrarPopupNotificacao(notificacao) {

  try {

    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const inscricao = await PushService.inscricaoAtual();
    if (inscricao) return;

    const opcoes = {
      body: notificacao.mensagem || "",
      icon: "/images/icon-192.png",
      badge: "/images/badge-96.png",
      tag: notificacao.id || notificacao.link || "vime",
      data: { url: notificacao.link || "/" },
    };

    const registro = await navigator.serviceWorker?.getRegistration();

    if (registro) {
      registro.showNotification(notificacao.titulo || "VIME 2.0", opcoes);
    } else {
      // Sem service worker registrado (nunca ativou push): a notificação
      // some sozinha do lado do navegador, sem passar pelo "notificationclick"
      // do sw.js -- por isso o clique é tratado aqui mesmo.
      const notif = new Notification(notificacao.titulo || "VIME 2.0", opcoes);
      notif.onclick = () => {
        window.focus();
        if (notificacao.link) window.location.href = notificacao.link;
        notif.close();
      };
    }

  } catch (e) {}

}
