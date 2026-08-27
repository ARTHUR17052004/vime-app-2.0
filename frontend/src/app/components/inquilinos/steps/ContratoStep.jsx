"use client";

function Campo({ label, obrigatorio, children }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-subtle)] mb-1.5">
        {label}
        {obrigatorio && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ContratoStep({
  formData,
  handleChange,
  obrigatorios = new Set(),
}) {
  const inputStyle =
    "w-full border border-[var(--border-token)] rounded-xl p-3 text-[var(--text)] bg-[var(--surface-2)] backdrop-blur placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="grid grid-cols-2 gap-4">

      <Campo label="Início do Contrato" obrigatorio>
        <input
          type="date"
          name="dataInicioContrato"
          value={formData.dataInicioContrato}
          onChange={handleChange}
          className={inputStyle}
          required
        />
      </Campo>

      <Campo label="Fim do Contrato" obrigatorio={obrigatorios.has("dataFimContrato")}>
        <input
          type="date"
          name="dataFimContrato"
          value={formData.dataFimContrato}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("dataFimContrato")}
        />
      </Campo>

      <Campo label="Prazo do Contrato (meses)">
        <input
          type="number"
          name="prazoContrato"
          value={formData.prazoContrato}
          className={`${inputStyle} opacity-70 cursor-not-allowed`}
          readOnly
        />
      </Campo>

      <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <p className="font-semibold text-emerald-400">
          Contrato automático
        </p>

        <p className="text-sm text-emerald-300/80 mt-1">
          Ao salvar, o contrato é gerado a partir do modelo cadastrado. Você poderá conferir o
          demonstrativo e só depois enviar para assinatura na Clicksign.
        </p>
      </div>

    </div>
  );
}
