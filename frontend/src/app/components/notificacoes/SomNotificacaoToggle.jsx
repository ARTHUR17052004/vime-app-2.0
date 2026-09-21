"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import {
  somAtivado,
  definirSomAtivado,
  tocarSomNotificacao,
} from "@/utils/somNotificacao";

export default function SomNotificacaoToggle() {

  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    setAtivo(somAtivado());
  }, []);

  function alternar() {
    const novo = !ativo;
    setAtivo(novo);
    definirSomAtivado(novo);
    if (novo) tocarSomNotificacao();
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--border-token)]
        bg-[var(--surface)]
        backdrop-blur-xl
        p-5
        flex
        items-center
        gap-4
        flex-wrap
      "
    >
      {ativo ? (
        <Volume2 size={20} className="text-emerald-400 shrink-0" />
      ) : (
        <VolumeX size={20} className="text-[var(--text-faint)] shrink-0" />
      )}

      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-semibold text-[var(--text)]">
          Som do VIME
        </p>
        <p className="mt-1 text-sm text-[var(--text-subtle)]">
          Toca um aviso sonoro quando chega notificação com o app aberto.
          Com o app fechado vale o som do próprio celular.
        </p>
      </div>

      <button
        onClick={alternar}
        role="switch"
        aria-checked={ativo}
        className={`
          shrink-0
          relative
          w-14
          h-8
          rounded-full
          transition
          ${ativo ? "bg-emerald-500" : "bg-[var(--surface-3)]"}
        `}
      >
        <span
          className={`
            absolute
            top-1
            w-6
            h-6
            rounded-full
            bg-white
            transition-all
            ${ativo ? "left-7" : "left-1"}
          `}
        />
      </button>
    </div>
  );
}
