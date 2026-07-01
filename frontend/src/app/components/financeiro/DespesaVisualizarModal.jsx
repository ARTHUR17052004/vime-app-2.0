"use client";

export default function DespesaVisualizarModal({
  isOpen,
  onClose,
  despesa,
}) {
  if (!isOpen || !despesa) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold mb-8">
          Despesa
        </h2>

        <div className="space-y-4">

          <div>
            <strong>Descrição:</strong>
            <div>{despesa.descricao}</div>
          </div>

          <div>
            <strong>Categoria:</strong>
            <div>{despesa.categoria}</div>
          </div>

          <div>
            <strong>Valor:</strong>
            <div>R$ {despesa.valor}</div>
          </div>

          <div>
            <strong>Status:</strong>
            <div>{despesa.status}</div>
          </div>

          <div>
            <strong>Fornecedor:</strong>
            <div>{despesa.fornecedor || "-"}</div>
          </div>

          <div>
            <strong>Observações:</strong>
            <div>{despesa.observacoes || "-"}</div>
          </div>

        </div>

      </div>

    </div>
  );
}