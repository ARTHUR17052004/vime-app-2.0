"use client";

import { useEffect, useState } from "react";

// Goiânia - GO. Open-Meteo não pede chave nem cadastro; se cair ou
// bloquear, o chip do clima simplesmente não aparece (nada quebra).
const LOCAL = {
  nome: "Goiânia - GO",
  latitude: -16.6869,
  longitude: -49.2648,
};

const CHAVE_CACHE = "vime-clima";
const VALIDADE_MS = 30 * 60 * 1000;

export function useClima() {
  const [clima, setClima] = useState(null);

  useEffect(() => {
    let cancelado = false;

    try {
      const salvo = JSON.parse(sessionStorage.getItem(CHAVE_CACHE) || "null");
      if (salvo && Date.now() - salvo.em < VALIDADE_MS) {
        setClima(salvo.dados);
        return;
      }
    } catch (e) {}

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LOCAL.latitude}&longitude=${LOCAL.longitude}&current=temperature_2m`
    )
      .then((r) => r.json())
      .then((json) => {
        const temperatura = json?.current?.temperature_2m;
        if (cancelado || typeof temperatura !== "number") return;

        const dados = { temperatura: Math.round(temperatura), local: LOCAL.nome };
        setClima(dados);

        try {
          sessionStorage.setItem(CHAVE_CACHE, JSON.stringify({ em: Date.now(), dados }));
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, []);

  return clima;
}
