"use client";

export default function VistoriaResumo({
  vistorias,
}) {

  const programadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "PROGRAMADA"
    ).length;

  const realizadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "REALIZADA"
    ).length;

  const atrasadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "ATRASADA"
    ).length;

  const total =
    vistorias.length;

  const cards = [

    {
      titulo: "Total",
      valor: total,
      cor: "text-white",
      fundo: "bg-white/10",
    },

    {
      titulo: "Programadas",
      valor: programadas,
      cor: "text-sky-400",
      fundo: "bg-sky-500/10",
    },

    {
      titulo: "Realizadas",
      valor: realizadas,
      cor: "text-emerald-400",
      fundo: "bg-emerald-500/10",
    },

    {
      titulo: "Atrasadas",
      valor: atrasadas,
      cor: "text-red-400",
      fundo: "bg-red-500/10",
    },

  ];

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="
            rounded-[22px]
            border
            border-white/10
            bg-gradient-to-br
            from-[#202a36]/95
            via-[#1b2430]/96
            to-[#151c25]/96
            backdrop-blur-xl
            p-6
            transition-all
            duration-300
            hover:border-emerald-500/30
            hover:shadow-[0_0_35px_rgba(16,185,129,.08)]
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400 text-sm">
                {card.titulo}
              </p>

              <h2
                className={`
                  text-4xl
                  font-black
                  mt-3
                  ${card.cor}
                `}
              >
                {card.valor}
              </h2>

            </div>

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                text-xl
                font-bold
                ${card.fundo}
                ${card.cor}
              `}
            >

              {card.valor}

            </div>

          </div>

        </div>

      ))}

    </div>

  );

}