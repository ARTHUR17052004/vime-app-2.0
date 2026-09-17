// Matemática compartilhada do "relógio de vacância/atraso" -- usada
// por VacanciaKitnet.jsx (kitnet vazia), PrazoSolicitacao.jsx (prazo
// vencido) e AtrasoVistoria.jsx (vistoria atrasada). Um só lugar pra
// essa conta evita cada componente reimplementar o "72h de
// tolerância, depois dia 1/2/3..." do jeito errado (já aconteceu).
export const HORAS_LIMITE = 72;
export const MS_LIMITE = HORAS_LIMITE * 60 * 60 * 1000;
export const MS_DIA = 24 * 60 * 60 * 1000;

export function formatarRelogio(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// `desdeMs`/`agoraMs`: timestamps em ms (Date.getTime()). `desde` é
// quando a tolerância começou (kitnet.vazioDesde, solicitacao.prazo,
// vistoria.dataProxima...).
export function calcularAlerta(desdeMs, agoraMs) {

  const decorrido = agoraMs - desdeMs;

  if (decorrido < MS_LIMITE) {
    return { emAlerta: false, restante: MS_LIMITE - decorrido, dias: 0 };
  }

  const dias = Math.floor((decorrido - MS_LIMITE) / MS_DIA) + 1;

  return { emAlerta: true, restante: 0, dias };

}
