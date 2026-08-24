"use client";

export default function ContratoStep({
  formData,
  handleChange,
}) {
  const inputStyle =
    "border border-[var(--border-token)] rounded-xl p-3 text-[var(--text)] bg-[var(--surface-2)] backdrop-blur placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="block text-xs text-[var(--text-subtle)] mb-1.5">
          Início do Contrato
        </label>
        <input
          type="date"
          name="dataInicioContrato"
          value={formData.dataInicioContrato}
          onChange={handleChange}
          className={`${inputStyle} w-full`}
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--text-subtle)] mb-1.5">
          Fim do Contrato
        </label>
        <input
          type="date"
          name="dataFimContrato"
          value={formData.dataFimContrato}
          onChange={handleChange}
          className={`${inputStyle} w-full`}
        />
      </div>

      <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <p className="font-semibold text-emerald-400">
          Contrato automático
        </p>

        <p className="text-sm text-emerald-300/80 mt-1">
          Ao salvar, o contrato é gerado a partir do modelo cadastrado e enviado para assinatura na Clicksign.
        </p>
      </div>

    </div>
  );
}