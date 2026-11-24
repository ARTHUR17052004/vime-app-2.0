"use client";

import { useEffect, useState } from "react";
import { Sessao } from "../../../utils/sessao";

// Miniatura de UMA foto/vídeo buscada sob demanda (ver
// vistoriaService.midiaUrl/midiaMissaoUrl) -- precisa de Authorization,
// então não dá pra usar direto num <img src>/<video src> (eles não
// mandam header nenhum). Busca com fetch() + token, converte em Blob, e
// só então decide se desenha <img> ou <video> -- pelo Content-Type de
// verdade da resposta (blob.type), nunca adivinhando pela URL.
export default function MidiaRemota({ src, className }) {

  const [estado, setEstado] = useState({ status: "carregando", url: null, tipo: null });

  useEffect(() => {

    let cancelado = false;
    let urlCriada = null;

    setEstado({ status: "carregando", url: null, tipo: null });

    if (!src) return undefined;

    const token = typeof window !== "undefined" ? Sessao.token() : null;

    fetch(src, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Falha ao carregar mídia.");
        return resposta.blob();
      })
      .then((blob) => {
        if (cancelado) return;
        urlCriada = URL.createObjectURL(blob);
        setEstado({ status: "pronto", url: urlCriada, tipo: blob.type });
      })
      .catch(() => {
        if (!cancelado) setEstado({ status: "erro", url: null, tipo: null });
      });

    return () => {
      cancelado = true;
      if (urlCriada) URL.revokeObjectURL(urlCriada);
    };

  }, [src]);

  if (estado.status === "erro") {
    return (
      <div className={`${className || ""} flex items-center justify-center bg-black/10 text-xs text-[var(--text-faint)] text-center p-2`}>
        Não foi possível carregar.
      </div>
    );
  }

  if (estado.status !== "pronto") {
    return (
      <div className={`${className || ""} flex items-center justify-center bg-black/10 text-xs text-[var(--text-faint)]`}>
        Carregando...
      </div>
    );
  }

  if (estado.tipo?.startsWith("video/")) {
    return <video src={estado.url} className={className} muted />;
  }

  return <img src={estado.url} alt="Mídia" className={className} />;

}
