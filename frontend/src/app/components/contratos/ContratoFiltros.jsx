"use client";

export default function ContratoFiltros({
  filtroSelecionado,
  setFiltroSelecionado,
}) {
  const filtros = [
    "Todos",
    "Ativos",
    "Pendentes",
    "Encerrados",
  ];

  return (
    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[var(--surface)]
        backdrop-blur-xl
        p-6
        shadow-xl
      "
    >

      <h2
        className="
          text-xl
          font-bold
          text-[var(--text)]
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
                  ? "bg-emerald-600 text-[var(--text)] shadow-lg"
                  : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
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