"use client";

export default function ContratoStep({
  formData,
  handleChange,
}) {
  const inputStyle =
    "border border-white/10 rounded-xl p-3 text-white bg-white/5 backdrop-blur placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
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
        <label className="block text-xs text-gray-400 mb-1.5">
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

      <input
        name="prazoContrato"
        placeholder="Prazo (meses)"
        value={formData.prazoContrato}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="tipoGarantia"
        value={formData.tipoGarantia}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          Tipo de Garantia
        </option>

        <option value="Caucao" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          Caução
        </option>

        <option value="Fiador" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          Fiador
        </option>

        <option value="Seguro" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          Seguro Fiança
        </option>
      </select>

      <input
        name="valorCaucao"
        placeholder="Valor da Caução"
        value={formData.valorCaucao}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="indiceReajuste"
        value={formData.indiceReajuste}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          Índice de Reajuste
        </option>

        <option value="IGPM" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          IGPM
        </option>

        <option value="IPCA" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
          IPCA
        </option>
      </select>

      <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <p className="font-semibold text-emerald-400">
          Contrato automático
        </p>

        <p className="text-sm text-emerald-300/80 mt-1">
          Futuramente esta etapa será integrada ao Clicksign para geração e assinatura automática.
        </p>
      </div>

    </div>
  );
}