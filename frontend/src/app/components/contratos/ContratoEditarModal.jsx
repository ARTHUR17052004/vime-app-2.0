"use client";

import ContratoForm from "./ContratoForm";

export default function ContratoEditarModal({
  isOpen,
  onClose,
  onSave,
  contrato,
}) {
  if (!isOpen || !contrato)
    return null;

  return (
    <div className="fixed inset-0 bg-[var(--surface-inset)] flex items-center justify-center z-50 p-4">

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] shadow-[0_18px_45px_rgba(0,0,0,.45)] rounded-3xl w-full max-w-5xl p-8 relative">

        <button
          onClick={onClose}
          className="
            absolute
            top-5
            right-5
            text-2xl
            text-[var(--text-subtle)]
          "
        >
          ✕
        </button>

        <ContratoForm
          contratoEditando={contrato}
          onSave={onSave}
        />

      </div>

    </div>
  );
}