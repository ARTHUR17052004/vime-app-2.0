"use client";

export default function ContratoStep({
  formData,
  handleChange,
}) {
  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="grid grid-cols-2 gap-4">

      <input
        type="date"
        name="dataInicioContrato"
        value={formData.dataInicioContrato}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        type="date"
        name="dataFimContrato"
        value={formData.dataFimContrato}
        onChange={handleChange}
        className={inputStyle}
      />

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
        <option value="">
          Tipo de Garantia
        </option>

        <option value="Caucao">
          Caução
        </option>

        <option value="Fiador">
          Fiador
        </option>

        <option value="Seguro">
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
        <option value="">
          Índice de Reajuste
        </option>

        <option value="IGPM">
          IGPM
        </option>

        <option value="IPCA">
          IPCA
        </option>
      </select>

      <div className="col-span-2 bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="font-semibold text-green-700">
          Contrato automático
        </p>

        <p className="text-sm text-green-600 mt-1">
          Futuramente esta etapa será integrada ao Clicksign para geração e assinatura automática.
        </p>
      </div>

    </div>
  );
}