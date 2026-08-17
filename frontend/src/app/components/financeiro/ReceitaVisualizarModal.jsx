"use client";

export default function ReceitaVisualizarModal({
  isOpen,
  onClose,
  receita,
}) {
  if (!isOpen || !receita) return null;

  return (
    <div className="fixed inset-0 bg-[var(--surface-inset)] flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-2xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl text-[var(--text-subtle)]"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[var(--text)] mb-8">
          Receita
        </h2>

        <div className="space-y-4 text-[var(--text-1)]">

          <div>
            <strong className="text-[var(--text-subtle)]">Descrição:</strong>
            <div>{receita.descricao}</div>
          </div>

          <div>
            <strong className="text-[var(--text-subtle)]">Categoria:</strong>
            <div>{receita.categoria}</div>
          </div>

          <div>
            <strong className="text-[var(--text-subtle)]">Valor:</strong>
            <div>R$ {receita.valor}</div>
          </div>

          <div>
            <strong className="text-[var(--text-subtle)]">Status:</strong>
            <div>{receita.status}</div>
          </div>

          <div>
            <strong className="text-[var(--text-subtle)]">Vencimento:</strong>
            <div>
              {receita.vencimento
                ? new Date(receita.vencimento).toLocaleDateString("pt-BR")
                : "-"}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}