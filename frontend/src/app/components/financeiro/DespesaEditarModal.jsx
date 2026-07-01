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

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl text-gray-500"
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