"use client";

export default function FinanceiroFiltros({
  filtroSelecionado,
  setFiltroSelecionado,
}) {
  const filtros = [
    "Hoje",
    "Ontem",
    "Última Semana",
    "Este Mês",
    "Mês Passado",
    "Último Ano",
    "Personalizado",
  ];

  return (
    <div className="bg-white rounded-3xl shadow p-4 mb-8">

      <div className="flex flex-wrap gap-3">

        {filtros.map((filtro) => (

          <button
            key={filtro}
            onClick={() =>
              setFiltroSelecionado(
                filtro
              )
            }
            className={`
              px-5
              py-3
              rounded-2xl
              transition
              font-medium
              ${
                filtroSelecionado ===
                filtro
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {filtro}
          </button>

        ))}

      </div>

    </div>
  );
}