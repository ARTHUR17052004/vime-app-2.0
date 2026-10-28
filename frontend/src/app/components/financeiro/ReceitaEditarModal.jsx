"use client";

import ReceitaForm from "./ReceitaForm";

export default function ReceitaEditarModal({
  isOpen,
  onClose,
  onSave,
  receita,
}) {
  if (!isOpen || !receita) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--surface-inset)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">

      <div className="min-h-full flex items-center justify-center">

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-3xl p-8 relative">

          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-2xl text-[var(--text-subtle)]"
          >
            ✕
          </button>

          <ReceitaForm
            receitaEditando={receita}
            onSave={onSave}
          />

        </div>

      </div>

    </div>
  );
}