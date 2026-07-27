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