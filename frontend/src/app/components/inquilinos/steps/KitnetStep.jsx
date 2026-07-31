"use client";

export default function KitnetStep({
  formData,
  handleChange,
  kitnets,
}) {

  const inputStyle =
    "w-full border border-gray-300 rounded-xl p-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

  const kitnetsDisponiveis =
    kitnets.filter((kitnet) => {

      if (
        String(kitnet.id) ===
        String(formData.kitnetId)
      ) {
        return true;
      }

      return kitnet.status !== "Ocupada";

    });

  return (

    <div className="grid gap-6">

      <div>

        <label className="block text-sm font-medium text-gray-600 mb-2">

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

          {kitnetsDisponiveis.map((kitnet) => (

            <option
              key={kitnet.id}
              value={kitnet.id}
            >

              {kitnet.unidadeNome} • {kitnet.nome} • Nº {kitnet.numero}

            </option>

          ))}

        </select>

      </div>

      {formData.kitnetId && (

        <div className="rounded-xl border border-green-200 bg-green-50 p-4">

          <p className="font-semibold text-green-700">

            Vinculação automática

          </p>

          <p className="mt-2 text-sm text-green-600">

            Ao concluir o cadastro, esta kitnet será vinculada ao inquilino e seu status será atualizado automaticamente para <strong>Ocupada</strong>.

          </p>

        </div>

      )}

    </div>

  );

}