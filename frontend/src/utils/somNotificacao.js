// Som do próprio VIME quando chega notificação com o app/site aberto.
// Gerado por código (Web Audio API), não é um arquivo de áudio -- assim
// fica garantido sempre no volume máximo, sem depender da mixagem de um
// .wav específico. Pra ajustar o som, é só mexer nas frequências/volume/
// duração em tocarBeep() abaixo. Com o app fechado quem toca é o som do
// sistema do celular, que o navegador não deixa trocar por código (ver
// sw.js). Vale pra qualquer tela, celular ou desktop -- notificação é
// notificação.

const CHAVE_PREFERENCIA = "vime-som-notificacao";
const INTERVALO_MINIMO_MS = 2000;

let contexto = null;
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

function obterContexto() {
  if (!contexto) {
    const AudioContextClasse = window.AudioContext || window.webkitAudioContext;
    contexto = new AudioContextClasse();
  }
  return contexto;
}

// Um "bip" isolado: ataque bem rápido (sobe na hora) e decaimento suave,
// no volume que for passado -- é isso que faz soar forte e nítido, em vez
// de abafado. "sawtooth" soa mais áspero/urgente que "triangle" (padrão).
function tocarBeep(ctx, inicio, frequencia, duracao, volume, tipoOnda = "triangle") {

  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();

  osc.type = tipoOnda;
  osc.frequency.setValueAtTime(frequencia, inicio);

  ganho.gain.setValueAtTime(0, inicio);
  ganho.gain.linearRampToValueAtTime(volume, inicio + 0.012);
  ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);

  osc.connect(ganho).connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracao + 0.05);

}

// Navegador só deixa o Web Audio tocar de verdade depois de um gesto do
// usuário (clique/toque/tecla) -- o contexto nasce "suspenso". Destrava
// no primeiro gesto pra que a notificação já toque na hora certa depois.
function destravarAudio() {
  try {
    const ctx = obterContexto();
    if (ctx.state === "suspended") ctx.resume();
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

// Títulos que tocam o alerta urgente (mais alto, mais insistente) em
// vez do "ding-ding" padrão -- coisa que não pode passar despercebida
// (ex.: kitnet vazia já com vistoria de entrega esperando o Zelador).
const TITULOS_URGENTES = ["Vistoria urgente: kitnet vazia"];

function ehUrgente(notificacao) {
  return Boolean(notificacao?.titulo && TITULOS_URGENTES.includes(notificacao.titulo));
}

// Chegando a mesma notificação por dois caminhos (socket e push) toca
// uma vez só. Navegador que ainda bloqueia áudio (nenhum gesto do
// usuário na página ainda) só ignora em silêncio. `notificacao` é
// opcional -- sem ela, toca sempre o som padrão.
export function tocarSomNotificacao(notificacao) {

  if (typeof window === "undefined" || !somAtivado()) return;

  const agora = Date.now();
  if (agora - ultimoToque < INTERVALO_MINIMO_MS) return;
  ultimoToque = agora;

  try {

    const ctx = obterContexto();
    if (ctx.state === "suspended") ctx.resume();

    const t0 = ctx.currentTime;

    if (ehUrgente(notificacao)) {

      // Alarme: 3 bipes curtos, secos e ásperos (dente de serra, não
      // triângulo) -- "beep-beep-beeep", dá pra reconhecer de ouvido,
      // sem precisar olhar pra tela.
      tocarBeep(ctx, t0, 880.0, 0.14, 1, "sawtooth");
      tocarBeep(ctx, t0 + 0.2, 880.0, 0.14, 1, "sawtooth");
      tocarBeep(ctx, t0 + 0.4, 880.0, 0.22, 1, "sawtooth");

    } else {

      // "Ding-ding!" ascendente, volume quase no talo (1 = máximo).
      tocarBeep(ctx, t0, 1046.5, 0.18, 0.9);        // C6
      tocarBeep(ctx, t0 + 0.16, 1568.0, 0.28, 0.95); // G6

    }

  } catch (e) {}

}
