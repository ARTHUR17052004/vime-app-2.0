// Som do próprio VIME quando chega notificação com o app aberto
// (public/sounds/notificacao.wav -- pra trocar por outro som, é só
// substituir esse arquivo mantendo o nome). Com o app fechado quem
// toca é o som do sistema do celular, que o navegador não deixa
// trocar por código (ver sw.js).

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

// Chegando a mesma notificação por dois caminhos (socket e push) toca
// uma vez só. Navegador que bloqueia autoplay (ainda sem nenhum toque
// do usuário na página) só ignora em silêncio.
export function tocarSomNotificacao() {

  // Só no celular (mesmo corte de largura da casca mobile) -- o desktop
  // continua exatamente como sempre foi.
  if (typeof window === "undefined" || !somAtivado()) return;
  if (!window.matchMedia("(max-width: 767px)").matches) return;

  const agora = Date.now();
  if (agora - ultimoToque < INTERVALO_MINIMO_MS) return;
  ultimoToque = agora;

  try {
    if (!audio) audio = new Audio(ARQUIVO);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}

}
