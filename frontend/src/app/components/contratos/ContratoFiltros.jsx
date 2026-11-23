"use client";

export default function ContratoFiltros({
  filtroSelecionado,
  setFiltroSelecionado,
  // Quando já tem um cartão "Filtros" por fora (ex.: contratos/page.js,
  // mesmo padrão unificado do Financeiro) -- pula o cartão/título
  // próprio e devolve só as pílulas, pra não duplicar.
  compact = false,
}) {
  const filtros = [
    "Todos",
    "Ativos",
    "Pendentes",
    "Vencendo",
    "Encerrados",
  ];

  const pills = (
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
                ? "bg-[var(--surface-2)] text-emerald-400 ring-2 ring-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,.45)]"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
            }
          `}
        >
          {filtro}
        </button>

      ))}

    </div>
  );

  if (compact) return pills;

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

      {pills}

    </div>
  );
}