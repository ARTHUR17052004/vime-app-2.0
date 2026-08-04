"use client";

export default function ContratoFiltros({
  filtroSelecionado,
  setFiltroSelecionado,
}) {
  const filtros = [
    "Todos",
    "Ativos",
    "Pendentes",
    "Inadimplentes",
    "Encerrados",
  ];

  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-slate-900/80
        backdrop-blur-xl
        p-6
        shadow-xl
      "
    >

      <h2
        className="
          text-xl
          font-bold
          text-white
          mb-5
        "
      >
        Filtros
      </h2>

      <div className="flex flex-wrap gap-3">

        {filtros.map((filtro) => (

          <button
            key={filtro}
            onClick={() =>
              setFiltroSelecionado(filtro)
            }
            className={`
              px-5
              py-2
              rounded-xl
              font-medium
              transition-all

              ${
                filtroSelecionado === filtro
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
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