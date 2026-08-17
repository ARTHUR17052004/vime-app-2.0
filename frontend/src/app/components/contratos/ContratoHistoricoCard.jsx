"use client";

export default function ContratoHistoricoCard({
  contrato,
}) {
  return (
    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
        Histórico do Contrato
      </h2>

      <div className="space-y-4">

        <div className="border border-[var(--border-token)] rounded-2xl p-5">
          <p className="text-[var(--text-subtle)] text-sm">
            Data de início
          </p>

          <div className="font-semibold text-[var(--text)]">
            {contrato.dataInicio}
          </div>
        </div>

        <div className="border border-[var(--border-token)] rounded-2xl p-5">
          <p className="text-[var(--text-subtle)] text-sm">
            Data de término
          </p>

          <div className="font-semibold text-[var(--text)]">
            {contrato.dataFim}
          </div>
        </div>

        <div className="border border-[var(--border-token)] rounded-2xl p-5">
          <p className="text-[var(--text-subtle)] text-sm">
            Status
          </p>

          <div className="font-semibold text-[var(--text)]">
            {contrato.status}
          </div>
        </div>

      </div>

    </div>
  );
}