"use client";

export default function AsaasFiltros() {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            Filtros
          </h2>

          <p className="text-gray-500 mt-1">
            Localize rapidamente qualquer cobrança.
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">

        <div className="xl:col-span-2">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pesquisar
          </label>

          <input
            type="text"
            placeholder="Cliente, CPF, cobrança..."
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>

          <select className="w-full border border-gray-300 rounded-xl p-3">

            <option>Todos</option>
            <option>Recebido</option>
            <option>Pendente</option>
            <option>Atrasado</option>
            <option>Cancelado</option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Forma
          </label>

          <select className="w-full border border-gray-300 rounded-xl p-3">

            <option>Todas</option>
            <option>PIX</option>
            <option>Boleto</option>
            <option>Cartão</option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Período
          </label>

          <input
            type="date"
            className="w-full border border-gray-300 rounded-xl p-3"
          />

        </div>

        <div className="flex items-end gap-3">

          <button
            className="
              flex-1
              bg-green-700
              hover:bg-green-800
              text-white
              rounded-xl
              py-3
            "
          >
            Filtrar
          </button>

          <button
            className="
              flex-1
              border
              border-gray-300
              hover:bg-gray-100
              rounded-xl
              py-3
            "
          >
            Limpar
          </button>

        </div>

      </div>

    </div>
  );
}