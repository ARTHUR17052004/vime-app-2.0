// Som do próprio VIME quando chega notificação com o app/site aberto
// (public/sounds/notificacao.wav -- pra trocar por outro som, é só
// substituir esse arquivo mantendo o nome). Com o app fechado quem
// toca é o som do sistema do celular, que o navegador não deixa
// trocar por código (ver sw.js). Vale pra qualquer tela, celular ou
// desktop -- notificação é notificação.

const ARQUIVO = "/sounds/notificacao.wav";
const CHAVE_PREFERENCIA = "vime-som-notificacao";
const INTERVALO_MINIMO_MS = 2000;

let audio = null;
let ultimoToque = 0;

export function somAtivado() {
  try {
    return localStorage.getItem(CHAVE_PREFERENCIA) !== "off";
  } catch (e) {
    return true;
  }
}

export function definirSomAtivado(ativado) {
  try {
    localStorage.setItem(CHAVE_PREFERENCIA, ativado ? "on" : "off");
  } catch (e) {}
}

// Navegador só deixa tocar áudio depois que o usuário interagiu com a
// página (clique/toque/tecla). No primeiro gesto, "destrava" o áudio pra
// que a notificação toque no ato em que chegar, sem depender de o usuário
// ter apertado algo logo antes.
function destravarAudio() {
  try {
    if (!audio) audio = new Audio(ARQUIVO);
    audio.muted = true;
    const p = audio.play();
    const restaurar = () => { audio.pause(); audio.currentTime = 0; audio.muted = false; };
    if (p && p.then) p.then(restaurar).catch(() => { audio.muted = false; });
    else restaurar();
  } catch (e) {}
}

if (typeof window !== "undefined") {
  const aoInteragir = () => {
    destravarAudio();
    ["pointerdown", "keydown", "touchstart"].forEach((t) =>
      window.removeEventListener(t, aoInteragir)
    );
  };
  ["pointerdown", "keydown", "touchstart"].forEach((t) =>
    window.addEventListener(t, aoInteragir, { passive: true })
  );
}

// Chegando a mesma notificação por dois caminhos (socket e push) toca
// uma vez só. Navegador que bloqueia autoplay (ainda sem nenhum toque
// do usuário na página) só ignora em silêncio.
export function tocarSomNotificacao() {

  if (typeof window === "undefined" || !somAtivado()) return;

  const agora = Date.now();
  if (agora - ultimoToque < INTERVALO_MINIMO_MS) return;
  ultimoToque = agora;

  try {
    if (!audio) audio = new Audio(ARQUIVO);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}

}
