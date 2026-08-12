"use client";

import DespesaForm from "./DespesaForm";

export default function DespesaEditarModal({
  isOpen,
  onClose,
  onSave,
  despesa,
}) {
  if (!isOpen || !despesa) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-3xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl text-gray-400"
        >
          ✕
        </button>

        <DespesaForm
          despesaEditando={despesa}
          onSave={onSave}
        />

      </div>

    </div>
  );
}