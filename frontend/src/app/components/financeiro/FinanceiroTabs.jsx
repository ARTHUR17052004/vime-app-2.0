"use client";

export default function FinanceiroTabs({
  abaSelecionada,
  setAbaSelecionada,
}) {
  const abas = [
    {
      id: "visao-geral",
      nome: "Visão Geral",
    },
    {
      id: "receitas",
      nome: "Receitas",
    },
    {
      id: "despesas",
      nome: "Despesas",
    },
    {
      id: "fluxo-caixa",
      nome: "Fluxo de Caixa",
    },
    {
      id: "asaas",
      nome: "Asaas",
    },
  ];

  return (
    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-2 mb-8">

      <div className="flex gap-2 flex-wrap">

        {abas.map((aba) => (

          <button
            key={aba.id}
            onClick={() =>
              setAbaSelecionada(aba.id)
            }
            className={`
              px-6
              py-3
              rounded-2xl
              font-medium
              transition
              ${
                abaSelecionada === aba.id
                  ? "bg-green-700 text-[var(--text)]"
                  : "text-[var(--text-subtle)] hover:bg-[var(--surface-2)]"
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