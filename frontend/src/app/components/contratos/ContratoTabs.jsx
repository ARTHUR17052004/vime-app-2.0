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
        rounded-[22px]

        border
        border-white/5

        bg-gradient-to-br
        from-[#1b2728]/80
        via-[#1a242c]/75
        to-[#151d26]/80

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
              px-6
              py-3

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
                    shadow-emerald-900/30
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