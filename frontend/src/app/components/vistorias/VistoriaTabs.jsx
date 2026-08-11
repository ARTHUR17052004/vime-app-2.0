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

    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-2
        mb-8
      "
    >

      <div className="flex flex-wrap gap-2">

      {abas.map((aba) => (

        <button
          key={aba.id}
          onClick={() =>
            setAbaSelecionada(
              aba.id
            )
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
                  bg-emerald-500
                  text-white
                  shadow-lg
                  shadow-emerald-500/20
                `
                : `
                  text-gray-300
                  hover:bg-white/5
                  hover:text-white
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