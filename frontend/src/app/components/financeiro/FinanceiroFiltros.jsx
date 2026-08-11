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
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-4 mb-8">

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
                  : "bg-white/5 text-gray-200 hover:bg-white/10"
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