"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

const CHAVE_DISPENSADO = "vime-instalar-dispensado";

function ehIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function rodandoStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)")?.matches
    || window.navigator.standalone === true;
}

// Selo pra instalar o app no celular -- Android/Chrome usa o prompt
// nativo (beforeinstallprompt); iOS Safari não dispara esse evento
// nunca, então mostra a instrução manual (Compartilhar -> Adicionar à
// Tela de Início) de qualquer jeito, sem depender de evento nenhum.
export default function InstalarAppBanner() {

  const [promptEvento, setPromptEvento] = useState(null);
  const [modo, setModo] = useState(null); // "android" | "ios" | null
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {

    if (rodandoStandalone()) return;

    try {
      if (localStorage.getItem(CHAVE_DISPENSADO) === "1") return;
    } catch (e) {}

    if (ehIOS()) {
      setModo("ios");
      setVisivel(true);
      return;
    }

    function aoTerPrompt(event) {
      event.preventDefault();
      setPromptEvento(event);
      setModo("android");
      setVisivel(true);
    }

    window.addEventListener("beforeinstallprompt", aoTerPrompt);
    return () => window.removeEventListener("beforeinstallprompt", aoTerPrompt);

  }, []);

  function dispensar() {
    setVisivel(false);
    try { localStorage.setItem(CHAVE_DISPENSADO, "1"); } catch (e) {}
  }

  async function instalar() {
    if (!promptEvento) return;
    promptEvento.prompt();
    await promptEvento.userChoice;
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div
      className="
        fixed
        inset-x-4
        bottom-4
        sm:inset-x-auto
        sm:right-4
        sm:max-w-sm

        z-40

        rounded-2xl
        border
        border-[var(--border-token)]
        bg-[var(--surface)]
        backdrop-blur-xl
        shadow-2xl

        p-4

        flex
        items-start
        gap-3
      "
    >
      <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
        {modo === "ios" ? <Share size={18} /> : <Download size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)]">
          Instale o VIME 2.0 no seu celular
        </p>

        {modo === "ios" ? (
          <p className="mt-1 text-xs text-[var(--text-subtle)]">
            Toque em <b>Compartilhar</b> e depois em{" "}
            <b>Adicionar à Tela de Início</b>.
          </p>
        ) : (
          <p className="mt-1 text-xs text-[var(--text-subtle)]">
            Acesso rápido, direto da tela inicial, como um app de verdade.
          </p>
        )}

        {modo === "android" && (
          <button
            onClick={instalar}
            className="
              mt-3
              inline-flex items-center gap-1.5
              px-3.5 py-2
              rounded-lg
              bg-emerald-500
              text-white
              text-xs
              font-semibold
              hover:bg-emerald-600
              transition
            "
          >
            <Download size={14} />
            Instalar
          </button>
        )}
      </div>

      <button
        onClick={dispensar}
        className="shrink-0 text-[var(--text-faint)] hover:text-[var(--text-subtle)] transition"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>
    </div>
  );

}
