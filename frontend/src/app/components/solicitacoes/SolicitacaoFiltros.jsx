"use client";

export default function SolicitacaoFiltros({
  pesquisa,
  setPesquisa,
  filtroStatus,
  setFiltroStatus,
}) {

  function limparFiltros() {

    setPesquisa("");

    setFiltroStatus("Todos");

  }

  return (

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 mb-8">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold text-white">
          Filtros
        </h2>

        <button
          onClick={limparFiltros}
          className="
            px-4
            py-2
            rounded-xl
            border
            border-white/10
            text-gray-300
            hover:bg-white/5
            transition
          "
        >
          Limpar Filtros
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pesquisar
          </label>

          <input
            type="text"
            placeholder="Pesquisar por número, título, responsável ou descrição..."
            value={pesquisa}
            onChange={(e) =>
              setPesquisa(e.target.value)
            }
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-green-700
            "
          />

        </div>

        <div>

          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>

          <select
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(e.target.value)
            }
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-green-700
            "
          >

            <option value="Todos">
              Todos
            </option>

            <option value="SOLICITADA">
              Solicitada
            </option>

            <option value="EM COTAÇÃO">
              Em Cotação
            </option>

            <option value="AGUARDANDO COMPRA">
              Aguardando Compra
            </option>

            <option value="ATENDIDA">
              Atendida
            </option>

            <option value="REJEITADA">
              Rejeitada
            </option>

          </select>

        </div>

      </div>

    </div>

  );

}