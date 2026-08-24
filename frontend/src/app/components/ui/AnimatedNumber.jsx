"use client";

import { useEffect, useRef, useState } from "react";

function facilitarSaida(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Anima a troca de um número pro próximo (conta subindo/descendo),
// usado nos cards do Modo TV pra dar a sensação de "ao vivo".
export function useAnimatedNumber(valor, duracaoMs = 900) {
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);
  const frame = useRef(null);

  useEffect(() => {
    const de = anterior.current;
    const para = valor;

    if (de === para) return;

    const inicio = performance.now();

    function passo(agora) {
      const t = Math.min((agora - inicio) / duracaoMs, 1);
      const progresso = facilitarSaida(t);

      setExibido(Math.round(de + (para - de) * progresso));

      if (t < 1) {
        frame.current = requestAnimationFrame(passo);
      } else {
        anterior.current = para;
      }
    }

    frame.current = requestAnimationFrame(passo);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return exibido;
}

export default function AnimatedNumber({ value, formatador }) {
  const exibido = useAnimatedNumber(value);

  return <>{formatador ? formatador(exibido) : exibido}</>;
}
