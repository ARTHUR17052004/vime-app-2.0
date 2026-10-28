"use client";

import { useRef } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";

// Em vários aparelhos/navegadores, um <input type="file"> sozinho abre
// direto a galeria (ou direto a câmera, se tiver `capture`) sem deixar
// escolher -- dois inputs escondidos (um com capture="environment",
// outro sem) atrás de dois botões visíveis garantem as duas opções em
// qualquer navegador, mobile ou desktop (no desktop "Tirar foto" não
// tem câmera pra abrir, então vira só mais um seletor de arquivo igual
// o outro -- não tem como evitar, é o próprio navegador quem decide).
export default function SeletorMidia({
  accept = "image/*",
  multiple = false,
  onArquivos,
  className = "",
  compacto = false,
}) {

  const refCamera = useRef(null);
  const refGaleria = useRef(null);

  if (compacto) {

    return (

      <div className={`flex items-center gap-2 ${className}`}>

        <input
          ref={refCamera}
          type="file"
          accept={accept}
          capture="environment"
          multiple={multiple}
          onChange={onArquivos}
          className="hidden"
        />

        <input
          ref={refGaleria}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onArquivos}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => refCamera.current?.click()}
          title="Tirar foto"
          className="
            w-10 h-10 rounded-xl
            border border-[var(--border-token)]
            bg-[var(--surface-2)]
            text-[var(--text-muted)]
            hover:border-emerald-500/40 hover:text-emerald-400
            transition
            flex items-center justify-center
          "
        >
          <Camera size={18} />
        </button>

        <button
          type="button"
          onClick={() => refGaleria.current?.click()}
          title="Escolher do aparelho"
          className="
            w-10 h-10 rounded-xl
            border border-[var(--border-token)]
            bg-[var(--surface-2)]
            text-[var(--text-muted)]
            hover:border-emerald-500/40 hover:text-emerald-400
            transition
            flex items-center justify-center
          "
        >
          <ImageIcon size={18} />
        </button>

      </div>

    );

  }

  return (

    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>

      <input
        ref={refCamera}
        type="file"
        accept={accept}
        capture="environment"
        multiple={multiple}
        onChange={onArquivos}
        className="hidden"
      />

      <input
        ref={refGaleria}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onArquivos}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => refCamera.current?.click()}
        className="
          flex-1 flex items-center justify-center gap-2
          rounded-xl border border-[var(--border-token)]
          bg-[var(--surface-2)]
          px-4 py-3
          text-[var(--text)] text-sm font-medium
          hover:border-emerald-500/40
          transition
        "
      >
        <Camera size={18} />
        Tirar foto
      </button>

      <button
        type="button"
        onClick={() => refGaleria.current?.click()}
        className="
          flex-1 flex items-center justify-center gap-2
          rounded-xl border border-[var(--border-token)]
          bg-[var(--surface-2)]
          px-4 py-3
          text-[var(--text)] text-sm font-medium
          hover:border-emerald-500/40
          transition
        "
      >
        <ImageIcon size={18} />
        Escolher do aparelho
      </button>

    </div>

  );

}
