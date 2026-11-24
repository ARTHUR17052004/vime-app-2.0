"use client";

import { useEffect, useState } from "react";

// <video src="data:video/...;base64,..."> com o vídeo inteiro embutido
// (sem nenhuma compressão hoje, uma vistoria pode facilmente passar de
// 30MB num vídeo só) não carrega/não toca na maioria dos navegadores,
// principalmente no celular -- um data: URI gigante é tratado como
// texto bruto, não como um arquivo de verdade, então o elemento de
// vídeo trava ou simplesmente nem aparece (bug reportado em
// 24/11/2026: "fotos" de vistoria que não abriam eram, na real, vídeos
// de conclusão anexados). Convertendo pra Blob URL antes de entregar
// pro <video>, o navegador passa a enxergar como um arquivo de
// verdade -- resolve sem precisar comprimir/recodificar o vídeo em si.
export default function MidiaVideo({ src, className, ...resto }) {

  const [blobUrl, setBlobUrl] = useState(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {

    let cancelado = false;
    let urlCriada = null;

    setBlobUrl(null);
    setFalhou(false);

    if (!src) return undefined;

    fetch(src)
      .then((resposta) => resposta.blob())
      .then((blob) => {
        if (cancelado) return;
        urlCriada = URL.createObjectURL(blob);
        setBlobUrl(urlCriada);
      })
      .catch(() => {
        if (!cancelado) setFalhou(true);
      });

    return () => {
      cancelado = true;
      if (urlCriada) URL.revokeObjectURL(urlCriada);
    };

  }, [src]);

  if (falhou) {
    return (
      <div className={`${className || ""} flex items-center justify-center bg-black/10 text-xs text-[var(--text-faint)] text-center p-2`}>
        Não foi possível carregar o vídeo.
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className={`${className || ""} flex items-center justify-center bg-black/10 text-xs text-[var(--text-faint)]`}>
        Carregando vídeo...
      </div>
    );
  }

  return <video src={blobUrl} className={className} {...resto} />;

}
