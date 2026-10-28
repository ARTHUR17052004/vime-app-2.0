"use client";

import { useEffect } from "react";
import { X, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

// Visualizador em tela cheia pra foto/vídeo de uma galeria -- thumbnail
// pequena (grid de fotos de vistoria, chamado, etc.) não dá pra ver
// detalhe nenhum nem baixar. Clicar nela abre isso: imagem grande,
// Baixar, Abrir em nova guia (dá pra dar zoom/segurar-salvar direto no
// navegador do celular) e setas pra passar pelas outras da mesma
// galeria sem fechar.
export default function MidiaLightbox({ itens = [], indice, onClose, onMudarIndice }) {

  const aberto = indice !== null && indice !== undefined && itens[indice] !== undefined;

  useEffect(() => {

    if (!aberto) return;

    const aoTeclar = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onMudarIndice?.((indice - 1 + itens.length) % itens.length);
      if (e.key === "ArrowRight") onMudarIndice?.((indice + 1) % itens.length);
    };

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);

  }, [aberto, indice, itens.length, onClose, onMudarIndice]);

  if (!aberto) return null;

  const midia = itens[indice];
  const isVideo = midia.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(midia);
  const nomeArquivo = `vime-midia-${indice + 1}.${isVideo ? "mp4" : "png"}`;

  return (

    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >

      <div
        className="flex items-center justify-end gap-2 p-4"
        onClick={(e) => e.stopPropagation()}
      >

        <a
          href={midia}
          download={nomeArquivo}
          title="Baixar"
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
        >
          <Download size={20} />
        </a>

        <a
          href={midia}
          target="_blank"
          rel="noreferrer"
          title="Abrir em nova guia"
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
        >
          <ExternalLink size={20} />
        </a>

        <button
          onClick={onClose}
          title="Fechar"
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
        >
          <X size={20} />
        </button>

      </div>

      <div
        className="flex-1 flex items-center justify-center px-4 pb-4 min-h-0 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {itens.length > 1 && (
          <button
            onClick={() => onMudarIndice?.((indice - 1 + itens.length) % itens.length)}
            title="Anterior"
            className="absolute left-2 sm:left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {isVideo ? (
          <video
            src={midia}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-2xl"
          />
        ) : (
          <img
            src={midia}
            alt={`Mídia ${indice + 1}`}
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        )}

        {itens.length > 1 && (
          <button
            onClick={() => onMudarIndice?.((indice + 1) % itens.length)}
            title="Próxima"
            className="absolute right-2 sm:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
          >
            <ChevronRight size={24} />
          </button>
        )}

      </div>

      {itens.length > 1 && (
        <div className="text-center text-white/70 text-sm pb-4">
          {indice + 1} / {itens.length}
        </div>
      )}

    </div>

  );

}
