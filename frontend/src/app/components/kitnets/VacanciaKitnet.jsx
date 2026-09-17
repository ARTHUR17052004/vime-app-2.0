"use client";

import { useEffect, useState } from "react";
import { Clock, TriangleAlert } from "lucide-react";

const HORAS_LIMITE = 24;
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
// as 24h corridas desde que ficou vazia (kitnet.vazioDesde, mantido
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

  // Tela usada muito no celular e por gente mais idosa -- pouco espaço
  // pra sutileza. Preto sobre amarelo e branco sobre vermelho forte é o
  // mesmo contraste de placa de alerta de trânsito, de propósito: dá
  // pra reconhecer de longe/sem precisar ler os números primeiro.
  if (!emAlerta) {

    const restante = MS_LIMITE - decorrido;

    return (
      <span
        className="
          inline-flex items-center gap-2
          rounded-2xl
          bg-amber-400
          px-4 py-2.5
          text-base font-extrabold text-slate-900
          tabular-nums
          shadow-[0_2px_10px_rgba(245,158,11,.45)]
        "
        title="Tempo restante até o alerta de vacância (24h)"
      >
        <Clock size={20} strokeWidth={2.5} />
        {formatarRelogio(restante)}
      </span>
    );

  }

  const dias = Math.floor(decorrido / MS_DIA);

  return (
    <span
      className="
        inline-flex items-center gap-2
        rounded-2xl
        bg-red-600
        px-4 py-2.5
        text-base font-extrabold text-white
        animate-pulse
        shadow-[0_2px_14px_rgba(220,38,38,.55)]
      "
      title="Kitnet vazia há mais de 24h -- notificando todo dia"
    >
      <TriangleAlert size={20} strokeWidth={2.5} />
      Vazia há {dias} {dias === 1 ? "dia" : "dias"}
    </span>
  );

}
