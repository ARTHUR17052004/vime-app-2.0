"use client";

export default function SolicitacaoTabs({
  abaSelecionada,
  setAbaSelecionada,
}) {

  const abas = [

    {
      id: "todas",
      nome: "Todas",
    },

    {
      id: "solicitadas",
      nome: "Solicitadas",
    },

    {
      id: "cotacao",
      nome: "Em Cotação",
    },

    {
      id: "compra",
      nome: "Aguardando Compra",
    },

    {
      id: "atendidas",
      nome: "Atendidas",
    },

    {
      id: "rejeitadas",
      nome: "Rejeitadas",
    },

  ];

  return (

    <div className="flex flex-wrap gap-3 mb-8">

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
            font-semibold
            transition

            ${

              abaSelecionada ===
              aba.id

                ? "bg-green-700 text-white border border-green-700"

                : "bg-white text-gray-700 border hover:bg-gray-100"

            }

          `}
        >

          {aba.nome}

        </button>

      ))}

    </div>

  );

}