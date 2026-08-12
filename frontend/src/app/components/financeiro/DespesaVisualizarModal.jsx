"use client";

export default function DespesaVisualizarModal({
  isOpen,
  onClose,
  despesa,
}) {
  if (!isOpen || !despesa) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-2xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-2xl text-gray-400"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-white mb-8">
          Despesa
        </h2>

        <div className="space-y-4 text-gray-200">

          <div>
            <strong className="text-gray-400">Descrição:</strong>
            <div>{despesa.descricao}</div>
          </div>

          <div>
            <strong className="text-gray-400">Categoria:</strong>
            <div>{despesa.categoria}</div>
          </div>

          <div>
            <strong className="text-gray-400">Valor:</strong>
            <div>R$ {despesa.valor}</div>
          </div>

          <div>
            <strong className="text-gray-400">Status:</strong>
            <div>{despesa.status}</div>
          </div>

          <div>
            <strong className="text-gray-400">Vencimento:</strong>
            <div>
              {despesa.vencimento
                ? new Date(despesa.vencimento).toLocaleDateString("pt-BR")
                : "-"}
            </div>
          </div>

          <div>
            <strong className="text-gray-400">Data de Pagamento:</strong>
            <div>
              {despesa.dataPagamento
                ? new Date(despesa.dataPagamento).toLocaleDateString("pt-BR")
                : "-"}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}