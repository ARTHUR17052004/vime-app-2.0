"use client";

import { useEffect, useState } from "react";
import { Clock, TriangleAlert } from "lucide-react";

const HORAS_LIMITE = 72;
const MS_LIMITE = HORAS_LIMITE * 60 * 60 * 1000;
const MS_DIA = 24 * 60 * 60 * 1000;

function formatarRelogio(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Relógio de vacância de uma kitnet: enquanto está DISPONIVEL, conta
// as 72h corridas desde que ficou vazia (kitnet.vazioDesde, mantido
// pela extensão do Prisma -- ver backend/src/config/prisma.js). Passado
// esse prazo sem locar, vira o aviso vermelho "vazia há N dia(s)" (o
// mesmo N que entra na notificação diária de verificarKitnetsVaziasJob.js).
// Some sozinho assim que a kitnet deixa de estar DISPONIVEL.
export default function VacanciaKitnet({ kitnet }) {

  const vazioDesdeMs =
    kitnet.status === "DISPONIVEL" && kitnet.vazioDesde
      ? new Date(kitnet.vazioDesde).getTime()
      : null;

  const [agora, setAgora] = useState(() => Date.now());

  const decorrido = vazioDesdeMs ? agora - vazioDesdeMs : 0;
  const emAlerta = vazioDesdeMs !== null && decorrido >= MS_LIMITE;

  useEffect(() => {

    if (!vazioDesdeMs) return;

    // Fase de contagem regressiva: precisa "andar" de verdade, de
    // segundo em segundo. Depois que já virou alerta, só o dia importa
    // -- de minuto em minuto já garante pegar a virada.
    const intervalo = setInterval(
      () => setAgora(Date.now()),
      emAlerta ? 60000 : 1000
    );

    return () => clearInterval(intervalo);

  }, [vazioDesdeMs, emAlerta]);

  if (!vazioDesdeMs) return null;

  if (!emAlerta) {

    const restante = MS_LIMITE - decorrido;

    return (
      <span
        className="
          inline-flex items-center gap-1.5
          rounded-full border border-amber-500/25 bg-amber-500/10
          px-3 py-1
          text-xs font-semibold text-amber-400
          tabular-nums
        "
        title="Tempo restante até o alerta de vacância (72h)"
      >
        <Clock size={13} />
        {formatarRelogio(restante)}
      </span>
    );

  }

  const dias = Math.floor((decorrido - MS_LIMITE) / MS_DIA) + 1;

  return (
    <span
      className="
        inline-flex items-center gap-1.5
        rounded-full border border-red-500/40 bg-red-500/15
        px-3 py-1
        text-xs font-bold text-red-500
        animate-pulse
      "
      title="Kitnet vazia há mais de 72h -- notificando a cada 24h"
    >
      <TriangleAlert size={13} />
      Vazia há {dias} {dias === 1 ? "dia" : "dias"}
    </span>
  );

}
