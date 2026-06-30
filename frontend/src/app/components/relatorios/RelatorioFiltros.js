"use client";

export default function RelatorioFiltros({

  pesquisa,
  setPesquisa,

}) {

  return (

    <div className="bg-white rounded-3xl shadow border p-6 mb-8">

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Pesquisar módulo

          </label>

          <input
            type="text"
            value={pesquisa}
            onChange={(e) =>
              setPesquisa(e.target.value)
            }
            placeholder="Ex.: Contratos..."
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-white
            "
          />

        </div>

        <div className="flex items-end">

          <button
            onClick={() => setPesquisa("")}
            className="
              w-full
              bg-gray-800
              text-white
              rounded-2xl
              py-3
              hover:bg-black
              transition
            "
          >

            Limpar Pesquisa

          </button>

        </div>

      </div>

    </div>

  );

}