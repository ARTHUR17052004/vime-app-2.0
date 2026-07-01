"use client";

export default function StepKitnet({
  formData,
  handleChange,
  kitnets,
}) {
  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

  const kitnetsDisponiveis =
    kitnets.filter((kitnet) => {
      if (
        String(kitnet.id) ===
        String(formData.kitnetId)
      ) {
        return true;
      }

      return (
        kitnet.status !== "Ocupada"
      );
    });

  return (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Kitnet
        </label>

        <select
          name="kitnetId"
          value={formData.kitnetId}
          onChange={handleChange}
          className={inputStyle}
          required
        >
          <option value="">
            Selecione uma Kitnet
          </option>

          {kitnetsDisponiveis.map(
            (kitnet) => (
              <option
                key={kitnet.id}
                value={kitnet.id}
              >
                {kitnet.unidadeNome} -{" "}
                {kitnet.nome}{" "}
                {kitnet.numero}
              </option>
            )
          )}
        </select>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-700 font-medium">
          Vinculação da Kitnet
        </p>

        <p className="text-sm text-green-600 mt-1">
          Ao salvar o inquilino,
          a kitnet será marcada
          como ocupada
          automaticamente.
        </p>
      </div>
    </div>
  );
}