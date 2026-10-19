"use client";

export default function ContratoTabs({
  abaSelecionada,
  setAbaSelecionada,
}) {
  const abas = [
    {
      id: "visao-geral",
      nome: "Visão Geral",
    },
    {
      id: "contratos",
      nome: "Contratos",
    },
    {
      id: "vencimentos",
      nome: "Vencimentos",
    },
    {
      id: "relatorios",
      nome: "Relatórios",
    },
  ];

  return (
    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[var(--surface-2)]
        backdrop-blur-xl
        p-2
      "
    >
      <div className="flex flex-wrap gap-2">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() =>
              setAbaSelecionada(aba.id)
            }
            className={`
              px-5
              py-2.5
              rounded-xl

              text-sm
              font-semibold

              transition-all
              duration-300

              ${
                abaSelecionada === aba.id
                  ? `
                    bg-[var(--surface-2)]
                    text-emerald-400
                    ring-2
                    ring-emerald-400/70
                    shadow-[0_0_18px_rgba(16,185,129,.45)]
                  `
                  : `
                    text-[var(--text-muted)]
                    hover:bg-[var(--surface-2)]
                    hover:text-[var(--text)]
                  `
              }
            `}
          >
            {aba.nome}
          </button>
        ))}
      </div>
    </div>
  );
}