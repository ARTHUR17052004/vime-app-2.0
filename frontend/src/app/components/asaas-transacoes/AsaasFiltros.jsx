"use client";

export default function AsaasFiltros() {
  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-white">
            Filtros
          </h2>

          <p className="text-gray-400 mt-1">
            Localize rapidamente qualquer cobrança.
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">

        <div className="xl:col-span-2">

          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Pesquisar
          </label>

          <input
            type="text"
            placeholder="Cliente, CPF, cobrança..."
            className="w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Status
          </label>

          <select className="w-full border border-white/[0.07] rounded-xl p-3 bg-white/5 text-white">

            <option className="bg-[#1b2430]">Todos</option>
            <option className="bg-[#1b2430]">Recebido</option>
            <option className="bg-[#1b2430]">Pendente</option>
            <option className="bg-[#1b2430]">Atrasado</option>
            <option className="bg-[#1b2430]">Cancelado</option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Forma
          </label>

          <select className="w-full border border-white/[0.07] rounded-xl p-3 bg-white/5 text-white">

            <option className="bg-[#1b2430]">Todas</option>
            <option className="bg-[#1b2430]">PIX</option>
            <option className="bg-[#1b2430]">Boleto</option>
            <option className="bg-[#1b2430]">Cartão</option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Período
          </label>

          <input
            type="date"
            className="w-full rounded-xl p-3"
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
              border-white/[0.07]
              text-gray-200
              hover:bg-white/5
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