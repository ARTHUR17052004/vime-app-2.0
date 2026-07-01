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
    <div className="bg-white rounded-3xl shadow p-2 mb-8">

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
                  : "text-gray-600 hover:bg-gray-100"
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