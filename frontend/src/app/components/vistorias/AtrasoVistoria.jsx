"use client";

import { useEffect, useState } from "react";
import { Clock, TriangleAlert } from "lucide-react";
import { MS_DIA, formatarRelogio } from "@/utils/prazoAlerta";

// Vistoria realizada ou cancelada não conta mais.
const STATUS_ENCERRADOS = ["REALIZADA", "CANCELADA"];

// Diferente de Kitnet/Solicitação (SeloPrazo -- tolerância de 72h
// DEPOIS do prazo vencido antes de virar alerta): aqui o relógio conta
// direto até a própria dataProxima, sem os 72h de tolerância somados --
// isso já virou o status real da vistoria (Programada -> Pendente nas
// últimas 72h antes do prazo, -> Atrasada no vencimento sem resposta,
// ver atualizarStatusVistoriasJob.js no backend). Mostrar esse relógio
// com +72h por cima deixava o número contradizendo a própria etiqueta
// de status (ex.: "Pendente" com relógio mostrando 125h).
export default function AtrasoVistoria({ vistoria }) {

  const dataProximaMs =
    !STATUS_ENCERRADOS.includes(vistoria.status) && vistoria.dataProxima
      ? new Date(vistoria.dataProxima).getTime()
      : null;

  const [agora, setAgora] = useState(() => Date.now());

  const vencida = dataProximaMs !== null && agora >= dataProximaMs;

  useEffect(() => {

    if (dataProximaMs === null) return;

    const intervalo = setInterval(
      () => setAgora(Date.now()),
      vencida ? 60000 : 1000
    );

    return () => clearInterval(intervalo);

  }, [dataProximaMs, vencida]);

  if (dataProximaMs === null) return null;

  if (!vencida) {

    const restante = dataProximaMs - agora;

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
        title="Tempo restante até o prazo da vistoria"
      >
        <Clock size={20} strokeWidth={2.5} />
        {formatarRelogio(restante)}
      </span>
    );

  }

  const dias = Math.floor((agora - dataProximaMs) / MS_DIA) + 1;

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
      title="Vistoria atrasada -- notificando todo dia"
    >
      <TriangleAlert size={20} strokeWidth={2.5} />
      {`Atrasada há ${dias} ${dias === 1 ? "dia" : "dias"}`}
    </span>
  );

}
