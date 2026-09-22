// Service worker só pra push notification (sem cache/offline -- isso
// é outro escopo). Registrado em src/services/push.service.js.
//
// Som: o navegador não deixa o site escolher o som da notificação do
// sistema (é o som padrão do canal "VIME" do Android, que o próprio
// usuário pode trocar em Configurações > Apps > VIME > Notificações).
// Com o app aberto quem toca é o som do VIME, na página (ver
// src/utils/somNotificacao.js). Aqui só dá pra escolher o padrão de
// vibração.
//
// Popup do sistema: sempre aparece, com app aberto ou fechado -- é
// assim que qualquer app de verdade se comporta. Com o app aberto e na
// tela, também avisa a página (pra tocar o som do VIME e atualizar o
// sino na hora).

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

        const visiveis = lista.filter(
          (c) => c.visibilityState === "visible" && c.focused
        );

        visiveis.forEach((c) => c.postMessage({ tipo: "push-recebido", dados }));

        return self.registration.showNotification(dados.title || "VIME 2.0", {
          body: dados.body || "",
          icon: "/images/icon-192.png",
          badge: "/images/badge-96.png",
          vibrate: [200, 100, 200, 100, 300],
          tag: dados.id || dados.url || "vime",
          renotify: true,
          data: { url: dados.url || "/" },
        });

      })

  );

});

// Clica na notificação -> foca uma janela já aberta no link, ou abre
// uma nova -- pelo app instalado, não pelo navegador solto. URL sempre
// absoluta: é o que faz o Android abrir no app (WebAPK) em vez do
// Chrome quando o app já foi instalado ("Adicionar à tela inicial").
self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {

      for (const cliente of lista) {
        if (cliente.url === url && "focus" in cliente) {
          return cliente.focus();
        }
      }

      if (lista.length > 0 && "navigate" in lista[0]) {
        return lista[0].navigate(url).then((c) => c && c.focus());
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

    })
  );

});
