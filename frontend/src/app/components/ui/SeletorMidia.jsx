"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";

import CameraCapture, { cameraSuportada } from "./CameraCapture";

// "Escolher do aparelho" é um <input type="file"> normal, sempre
// funciona. "Tirar foto" NÃO pode depender de <input capture> -- é só
// uma dica que vários Chrome Android ignoram (confirmado: cai direto
// no Seletor de Fotos do Android em vez da câmera, mesmo sem
// `multiple`), então abre a câmera de verdade dentro da página
// (getUserMedia, ver CameraCapture.jsx) e só cai pro <input capture>
// como último recurso, se o navegador nem isso suportar.
export default function SeletorMidia({
  accept = "image/*",
  multiple = false,
  onArquivos,
  className = "",
  compacto = false,
}) {

  const refCameraFallback = useRef(null);
  const refGaleria = useRef(null);

  const [cameraAberta, setCameraAberta] = useState(false);

  const abrirCamera = () => {
    if (cameraSuportada()) {
      setCameraAberta(true);
    } else {
      refCameraFallback.current?.click();
    }
  };

  const aoCapturar = (arquivo) => {
    setCameraAberta(false);
    onArquivos?.({ target: { files: [arquivo], value: "" } });
  };

  const botoes = (

    <>

      <input
        ref={refCameraFallback}
        type="file"
        accept={accept}
        capture="environment"
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

      <CameraCapture
        aberto={cameraAberta}
        onFechar={() => setCameraAberta(false)}
        onCapturar={aoCapturar}
      />

    </>

  );

  if (compacto) {

    return (

      <div className={`flex items-center gap-2 ${className}`}>

        {botoes}

        <button
          type="button"
          onClick={abrirCamera}
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

      {botoes}

      <button
        type="button"
        onClick={abrirCamera}
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
