"use client";

export default function VistoriaTabs({
  abaSelecionada,
  setAbaSelecionada,
}) {

  const abas = [
    {
      id: "visao-geral",
      nome: "Visão Geral",
    },
    {
      id: "agendadas",
      nome: "Agendadas",
    },
    {
      id: "realizadas",
      nome: "Realizadas",
    },
    {
      id: "pendentes",
      nome: "Pendentes",
    },
    {
      id: "atrasadas",
      nome: "Atrasadas",
    },
  ];

  return (

    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-2 mb-8">

      <div className="flex gap-2 flex-wrap">

      {abas.map((aba) => (

        <button
          key={aba.id}
          onClick={() =>
            setAbaSelecionada(
              aba.id
            )
          }
          className={`
            px-6
            py-3
            rounded-2xl
            font-medium
            transition

            ${
              abaSelecionada === aba.id
                ? "bg-[var(--surface-2)] text-emerald-400 ring-2 ring-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,.45)]"
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