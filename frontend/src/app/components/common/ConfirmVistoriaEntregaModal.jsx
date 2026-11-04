"use client";

import { KeyRound } from "lucide-react";

import Button from "../ui/Button";

// Pergunta reutilizada em todo fluxo que pode esvaziar uma kitnet
// (excluir inquilino, editar kitnet de Ocupada pra Vazia, etc.) --
// evita vistoria de entrega órfã quando a kitnet já tem locação
// marcada pro mesmo dia (o locador sabe disso, o sistema não).
export default function ConfirmVistoriaEntregaModal({ isOpen, nomeKitnet, onEscolher }) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[var(--surface-inset)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="min-h-full flex items-center justify-center">
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-md p-8">

          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
            <KeyRound className="w-6 h-6 text-amber-400" />
          </div>

          <h2 className="text-xl font-bold text-[var(--text)] mb-2">
            Enviar vistoria de entrega?
          </h2>

          <p className="text-sm text-[var(--text-subtle)] mb-8">
            {nomeKitnet ? `A kitnet "${nomeKitnet}" vai` : "A kitnet vai"} ficar vazia. Se já tiver outra locação marcada pro mesmo dia, escolha &quot;Não&quot; pra não gerar uma vistoria órfã.
          </p>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => onEscolher(false)}
            >
              Não, só esvaziar
            </Button>

            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => onEscolher(true)}
            >
              Sim, enviar vistoria
            </Button>

          </div>

        </div>
      </div>
    </div>
  );

}
