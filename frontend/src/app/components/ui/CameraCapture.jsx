"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera as CameraIcon, RotateCcw } from "lucide-react";

// `<input capture="environment">` é só uma DICA pro navegador -- vários
// Chrome Android (confirmado: esse aqui cai no Seletor de Fotos do
// Android/Google Fotos, não na câmera) simplesmente ignoram e mostram
// a galeria de qualquer jeito, mesmo sem `multiple`. Só dá pra GARANTIR
// câmera abrindo o stream de vídeo direto (getUserMedia) e tirando a
// foto dentro da própria página -- é o que isso aqui faz. Onde o
// navegador não suportar getUserMedia (raríssimo, hoje em dia), quem
// usa este componente cai pro <input capture> como último recurso (ver
// `suportado` exportado).
export const cameraSuportada = () =>
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

export default function CameraCapture({ aberto, onFechar, onCapturar }) {

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [erro, setErro] = useState("");
  const [pronta, setPronta] = useState(false);

  useEffect(() => {

    if (!aberto) return;

    let cancelado = false;

    setErro("");
    setPronta(false);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {

        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

      })
      .catch(() => {
        if (!cancelado) {
          setErro("Não consegui abrir a câmera -- confirma se o navegador tem permissão de câmera pra esse site (ícone de cadeado na barra de endereço) e tenta de novo.");
        }
      });

    return () => {

      cancelado = true;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

    };

  }, [aberto]);

  if (!aberto) return null;

  const capturar = () => {

    const video = videoRef.current;

    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {

        if (!blob) return;

        const arquivo = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });

        onCapturar?.(arquivo);

      },
      "image/jpeg",
      0.85
    );

  };

  return (

    <div className="fixed inset-0 z-[1000] bg-black flex flex-col">

      <div className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">

        <button
          type="button"
          onClick={onFechar}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
        >
          <X size={20} />
        </button>

      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 relative">

        {erro ? (

          <div className="px-8 text-center text-white">
            <p className="text-sm">{erro}</p>
          </div>

        ) : (

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setPronta(true)}
            className="max-w-full max-h-full"
          />

        )}

      </div>

      <div
        className="
          flex items-center justify-center gap-6
          p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]
        "
      >

        {erro ? (

          <button
            type="button"
            onClick={() => {
              setErro("");
              setPronta(false);
              if (videoRef.current) videoRef.current.srcObject = null;
              // Força o efeito a tentar de novo -- fecha e reabre.
              onFechar?.();
            }}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-white text-sm font-semibold"
          >
            <RotateCcw size={18} />
            Fechar e tentar de novo
          </button>

        ) : (

          <button
            type="button"
            onClick={capturar}
            disabled={!pronta}
            title="Tirar foto"
            className="
              w-16 h-16 rounded-full
              bg-white
              disabled:opacity-40
              flex items-center justify-center
              transition
              active:scale-95
            "
          >
            <CameraIcon size={28} className="text-slate-900" />
          </button>

        )}

      </div>

    </div>

  );

}
