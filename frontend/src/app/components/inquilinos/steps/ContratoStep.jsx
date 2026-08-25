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

      <Campo label="Prazo do Contrato (meses)" obrigatorio={obrigatorios.has("prazoContrato")}>
        <input
          type="number"
          min={1}
          name="prazoContrato"
          placeholder="Ex: 12"
          value={formData.prazoContrato}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("prazoContrato")}
        />
      </Campo>

      <Campo label="Índice de Reajuste" obrigatorio={obrigatorios.has("indiceReajuste")}>
        <input
          name="indiceReajuste"
          placeholder="Ex: IGPM, IPCA"
          value={formData.indiceReajuste}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("indiceReajuste")}
        />
      </Campo>

      <Campo label="Tipo de Garantia" obrigatorio={obrigatorios.has("tipoGarantia")}>
        <select
          name="tipoGarantia"
          value={formData.tipoGarantia}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("tipoGarantia")}
        >
          <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
            Selecione...
          </option>
          <option value="CAUCAO" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
            Caução
          </option>
          <option value="FIADOR" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
            Fiador
          </option>
          <option value="SEGURO_FIANCA" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
            Seguro Fiança
          </option>
        </select>
      </Campo>

      <Campo label="Valor da Caução" obrigatorio={obrigatorios.has("valorCaucao")}>
        <input
          type="number"
          name="valorCaucao"
          placeholder="Valor da Caução"
          value={formData.valorCaucao}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("valorCaucao")}
        />
      </Campo>

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
