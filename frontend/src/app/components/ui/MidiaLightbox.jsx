"use client";

import { useEffect, useState } from "react";
import { X, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Sessao } from "../../../utils/sessao";

// Visualizador em tela cheia pra foto/vídeo de uma galeria -- thumbnail
// pequena (grid de fotos de vistoria, chamado, etc.) não dá pra ver
// detalhe nenhum nem baixar. Clicar nela abre isso: imagem grande,
// Baixar, Abrir em nova guia (dá pra dar zoom/segurar-salvar direto no
// navegador do celular) e setas pra passar pelas outras da mesma
// galeria sem fechar.
//
// `itens` pode ser tanto um array de "data:" URI (telas que editam e já
// têm o arquivo inteiro em memória) quanto de URL remota autenticada
// (telas só de visualização, ver vistoriaService.midiaUrl/midiaMissaoUrl
// -- essas não dão pra usar direto num <img src>/<video src>, exigem
// Authorization). Os dois casos passam pelo mesmo caminho aqui: busca
// com fetch() (token só entra de verdade pra URL remota -- num data:
// URI o header é ignorado, sem efeito nenhum) e converte em Blob antes
// de desenhar. Isso também resolve o vídeo grande (>15MB) que travava
// direto num <video src="data:..."> -- como Blob, o navegador trata
// como arquivo de verdade. O tipo (foto/vídeo) vem do Content-Type de
// verdade da resposta (blob.type), não mais de adivinhar pelo prefixo
// da string.
export default function MidiaLightbox({ itens = [], indice, onClose, onMudarIndice }) {

  const aberto = indice !== null && indice !== undefined && itens[indice] !== undefined;
  const midia = aberto ? itens[indice] : null;

  const [estado, setEstado] = useState({ status: "carregando", url: null, tipo: null });

  useEffect(() => {

    setEstado({ status: "carregando", url: null, tipo: null });

    if (!midia) return undefined;

    let cancelado = false;
    let urlCriada = null;

    const token = typeof window !== "undefined" ? Sessao.token() : null;

    fetch(midia, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
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

  }, [midia]);

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

  const isVideo = estado.tipo?.startsWith("video/");
  const nomeArquivo = `vime-midia-${indice + 1}.${isVideo ? "mp4" : "jpg"}`;

  return (

    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >

      <div
        className="flex items-center justify-end gap-2 p-4"
        onClick={(e) => e.stopPropagation()}
      >

        {estado.url && (

          <a
            href={estado.url}
            download={nomeArquivo}
            title="Baixar"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
          >
            <Download size={20} />
          </a>

        )}

        {estado.url && (

          <a
            href={estado.url}
            target="_blank"
            rel="noreferrer"
            title="Abrir em nova guia"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
          >
            <ExternalLink size={20} />
          </a>

        )}

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

        {estado.status === "erro" && (
          <p className="text-white/70 text-sm">Não foi possível carregar essa mídia.</p>
        )}

        {estado.status === "carregando" && (
          <p className="text-white/70 text-sm">Carregando...</p>
        )}

        {estado.status === "pronto" && (
          isVideo ? (
            <video
              src={estado.url}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-2xl"
            />
          ) : (
            <img
              src={estado.url}
              alt={`Mídia ${indice + 1}`}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          )
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
