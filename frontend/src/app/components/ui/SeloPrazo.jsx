"use client";

import { useEffect, useState } from "react";
import { Clock, TriangleAlert } from "lucide-react";
import { formatarRelogio, calcularAlerta } from "@/utils/prazoAlerta";

// Selo genérico de "relógio de tolerância -> alerta vermelho", usado
// em Kitnets (vazia), Solicitações (prazo vencido) e Vistorias
// (atrasada) -- ver VacanciaKitnet.jsx, PrazoSolicitacao.jsx e
// AtrasoVistoria.jsx, que só decidem o `desde` (a partir de quando
// contar) e o texto; a conta e o visual moram só aqui.
//
// Cor sólida (não um tom translúcido) de propósito: essas telas são
// usadas muito no celular e por gente mais idosa, então segue a mesma
// lógica de placa de alerta de trânsito -- preto sobre amarelo, branco
// sobre vermelho forte -- pra dar pra reconhecer de longe, antes mesmo
// de ler o número.
export default function SeloPrazo({
  desde,
  tituloContagem,
  tituloAlerta,
  textoAlerta,
}) {

  const desdeMs = desde ? new Date(desde).getTime() : null;

  const [agora, setAgora] = useState(() => Date.now());

  const { emAlerta, restante, dias } =
    desdeMs !== null
      ? calcularAlerta(desdeMs, agora)
      : { emAlerta: false, restante: 0, dias: 0 };

  useEffect(() => {

    if (desdeMs === null) return;

    // Fase de contagem regressiva: precisa "andar" de verdade, de
    // segundo em segundo. Depois que já virou alerta, só o dia importa
    // -- de minuto em minuto já garante pegar a virada.
    const intervalo = setInterval(
      () => setAgora(Date.now()),
      emAlerta ? 60000 : 1000
    );

    return () => clearInterval(intervalo);

  }, [desdeMs, emAlerta]);

  if (desdeMs === null) return null;

  if (!emAlerta) {

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
        title={tituloContagem}
      >
        <Clock size={20} strokeWidth={2.5} />
        {formatarRelogio(restante)}
      </span>
    );

  }

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
      title={tituloAlerta}
    >
      <TriangleAlert size={20} strokeWidth={2.5} />
      {textoAlerta(dias)}
    </span>
  );

}
