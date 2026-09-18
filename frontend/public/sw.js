// Service worker só pra push notification (sem cache/offline -- isso
// é outro escopo). Registrado em src/services/push.service.js.

self.addEventListener("push", (event) => {

  let dados = {};

  try {
    dados = event.data ? event.data.json() : {};
  } catch (e) {
    dados = { title: "VIME 2.0", body: event.data ? event.data.text() : "" };
  }

  const titulo = dados.title || "VIME 2.0";

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: dados.body || "",
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url: dados.url || "/" },
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
