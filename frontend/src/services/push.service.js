import { api } from "./api";

// Base64url (o formato que VAPID usa) -> Uint8Array, formato que
// PushManager.subscribe() espera em applicationServerKey.
function chaveParaUint8Array(chaveBase64) {

  const padding = "=".repeat((4 - (chaveBase64.length % 4)) % 4);
  const base64 = (chaveBase64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(base64);

  const saida = new Uint8Array(bruto.length);
  for (let i = 0; i < bruto.length; i++) {
    saida[i] = bruto.charCodeAt(i);
  }

  return saida;

}

export const PushService = {

  suportado() {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  },

  permissao() {
    if (typeof Notification === "undefined") return "unsupported";
    return Notification.permission; // "granted" | "denied" | "default"
  },

  async inscricaoAtual() {
    if (!this.suportado()) return null;
    const registro = await navigator.serviceWorker.getRegistration();
    if (!registro) return null;
    return registro.pushManager.getSubscription();
  },

  // Pede permissão (se ainda não decidida), registra o service worker
  // e envia a inscrição pro backend. Lança erro com mensagem amigável
  // se algo no caminho não der certo.
  async ativar() {

    if (!this.suportado()) {
      throw new Error("Este navegador não suporta notificações no celular.");
    }

    const permissaoAtual = await Notification.requestPermission();

    if (permissaoAtual !== "granted") {
      throw new Error("Permissão de notificação negada.");
    }

    const chaveResp = await api("/push/chave-publica");
    const chavePublica = chaveResp.data?.chavePublica;

    if (!chavePublica) {
      throw new Error("Notificação no celular não está configurada no servidor.");
    }

    const registro = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let subscription = await registro.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chaveParaUint8Array(chavePublica),
      });
    }

    await api("/push/inscrever", {
      method: "POST",
      body: JSON.stringify(subscription.toJSON()),
    });

    return subscription;

  },

  async desativar() {

    const subscription = await this.inscricaoAtual();

    if (!subscription) return;

    await api("/push/desinscrever", {
      method: "POST",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();

  },

};
