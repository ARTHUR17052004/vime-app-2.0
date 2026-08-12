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
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-2 mb-8">

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
                  ? "bg-green-700 text-white"
                  : "text-gray-400 hover:bg-white/5"
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