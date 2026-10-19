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
    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-4 mb-8">

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
                  ? "bg-[var(--surface-2)] text-emerald-400 ring-2 ring-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,.45)]"
                  : "bg-[var(--surface-2)] text-[var(--text-1)] hover:bg-[var(--surface-3)]"
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