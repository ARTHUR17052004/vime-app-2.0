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
            transition-all
            duration-300

            ${
              abaSelecionada === aba.id
                ? `
                  bg-emerald-500
                  text-white
                  shadow-lg
                  shadow-emerald-500/20
                `
                : `
                  bg-white/5
                  border
                  border-white/10
                  text-gray-300
                  hover:bg-white/10
                  hover:border-emerald-500/30
                `
            }
          `}
        >

          {aba.nome}

        </button>

      ))}

    </div>

  );

}