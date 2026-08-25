"use client";

export default function KitnetStep({
  formData,
  handleChange,
  kitnets,
}) {

  const inputStyle =
    "w-full border border-[var(--border-token)] rounded-xl p-3 text-[var(--text)] bg-[var(--surface-2)] backdrop-blur placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

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

        <label className="block text-sm font-medium text-[var(--text-subtle)] mb-2">

          Kitnet
          <span className="ml-1 text-red-400">*</span>

        </label>

        <select
          name="kitnetId"
          value={formData.kitnetId}
          onChange={handleChange}
          className={inputStyle}
          required
        >

          <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>

            Selecione uma Kitnet

          </option>

          {kitnetsDisponiveis.map((kitnet) => (

            <option
              key={kitnet.id}
              value={kitnet.id}
              style={{ backgroundColor: "#1d2833", color: "#fff" }}
            >

              {kitnet.unidade?.nome || kitnet.unidadeNome} • {kitnet.nome} • Nº {kitnet.numero}

            </option>

          ))}

        </select>

      </div>

      {formData.kitnetId && (

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

          <p className="font-semibold text-emerald-400">

            Vinculação automática

          </p>

          <p className="mt-2 text-sm text-emerald-300/80">

            Ao concluir o cadastro, esta kitnet será vinculada ao inquilino e seu status será atualizado automaticamente para <strong>Ocupada</strong>.

          </p>

        </div>

      )}

    </div>

  );

}