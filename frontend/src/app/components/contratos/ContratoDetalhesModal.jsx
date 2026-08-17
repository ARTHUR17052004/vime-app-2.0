"use client";

export default function ContratoDetalhesModal({
  isOpen,
  onClose,
  contrato,
}) {
  if (!isOpen || !contrato)
    return null;

  return (
    <div className="fixed inset-0 bg-[var(--surface-inset)] flex items-center justify-center z-50 p-4">

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] shadow-[0_18px_45px_rgba(0,0,0,.45)] rounded-3xl w-full max-w-3xl p-8 relative">

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

        <h2 className="text-3xl font-bold text-[var(--text)] mb-8">
          Detalhes do Contrato
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-[var(--text-subtle)]">
              Inquilino
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.inquilino?.nome || contrato.inquilinoNome}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Residência
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.unidade?.nome || contrato.unidadeNome}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Kitnet
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.kitnet?.nome || contrato.kitnetNome}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Valor Aluguel
            </p>

            <p className="font-semibold text-[var(--text)]">
              R$ {contrato.valorAluguel}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Dia Vencimento
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.diaVencimento}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Data de Criação
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.dataInicio
                ? new Date(contrato.dataInicio).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Data Final do Contrato
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.dataFim
                ? new Date(contrato.dataFim).toLocaleDateString("pt-BR")
                : "Indeterminado"}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Garantia
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.tipoGarantia}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Valor Caução
            </p>

            <p className="font-semibold text-[var(--text)]">
              R$ {contrato.valorCaucao}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Índice Reajuste
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.indiceReajuste}
            </p>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Status
            </p>

            <p className="font-semibold text-[var(--text)]">
              {contrato.status}
            </p>
          </div>

        </div>

        <div className="mt-8">

          <p className="text-[var(--text-subtle)] mb-2">
            Observações
          </p>

          <div className="bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text-1)] rounded-2xl p-5">
            {contrato.observacoes ||
              "Nenhuma observação"}
          </div>

        </div>

      </div>

    </div>
  );
}