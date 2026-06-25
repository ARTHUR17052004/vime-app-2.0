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
      id: "ocorrencias",
      nome: "Ocorrências",
    },
  ];

  return (

    <div className="flex gap-4 mb-8 flex-wrap">

      {abas.map((aba) => (

        <button
          key={aba.id}
          onClick={() =>
            setAbaSelecionada(
              aba.id
            )
          }
          className={`px-6 py-3 rounded-2xl transition
          ${
            abaSelecionada ===
            aba.id
              ? "bg-green-700 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          {aba.nome}
        </button>

      ))}

    </div>

  );

}