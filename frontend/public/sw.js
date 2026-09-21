// Service worker só pra push notification (sem cache/offline -- isso
// é outro escopo). Registrado em src/services/push.service.js.
//
// Som: o navegador não deixa o site escolher o som da notificação do
// sistema (é o som padrão do canal "VIME" do Android, que o próprio
// usuário pode trocar em Configurações > Apps > VIME > Notificações).
// Com o app aberto quem toca é o som do VIME, na página (ver
// src/utils/somNotificacao.js). Aqui só dá pra escolher o padrão de
// vibração.

self.addEventListener("push", (event) => {

  let dados = {};

  try {
    dados = event.data ? event.data.json() : {};
  } catch (e) {
    dados = { title: "VIME 2.0", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(

    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((lista) => {

        // App aberto e na tela: não empilha notificação do sistema por
        // cima -- avisa a página, que atualiza o sino e toca o som.
        const visiveis = lista.filter(
          (c) => c.visibilityState === "visible" && c.focused
        );

        if (visiveis.length > 0) {
          visiveis.forEach((c) => c.postMessage({ tipo: "push-recebido", dados }));
          return;
        }

        return self.registration.showNotification(dados.title || "VIME 2.0", {
          body: dados.body || "",
          icon: "/images/icon-192.png",
          badge: "/images/badge-96.png",
          vibrate: [200, 100, 200, 100, 300],
          tag: dados.url || "vime",
          renotify: true,
          data: { url: dados.url || "/" },
        });

      })

  );

});

// Clica na notificação -> foca uma aba já aberta no link, ou abre uma nova.
self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {

      for (const cliente of lista) {
        if (cliente.url.includes(url) && "focus" in cliente) {
          return cliente.focus();
        }
      }

      if (lista.length > 0 && "focus" in lista[0]) {
        lista[0].navigate(url);
        return lista[0].focus();
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

    })
  );

});
