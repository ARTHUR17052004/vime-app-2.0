"use client";

export default function VistoriaDashboard({
  vistorias,
}) {

  const agendadas =
    vistorias.filter(
      (v) => v.status === "AGENDADA"
    ).length;

  const realizadas =
    vistorias.filter(
      (v) => v.status === "REALIZADA"
    ).length;

  const pendentes =
    vistorias.filter(
      (v) => v.status === "PENDENTE"
    ).length;

  const cards = [

    {
      titulo: "Agendadas",
      valor: agendadas,
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
      titulo: "Pendentes",
      valor: pendentes,
      cor: "text-yellow-400",
      fundo: "bg-yellow-500/10",
    },

  ];

  return (

    <div
      className="
        rounded-[22px]
        border
        border-white/10
        bg-gradient-to-br
        from-[#202a36]/95
        via-[#1b2430]/96
        to-[#151c25]/96
        backdrop-blur-xl
        p-8
      "
    >

      <h2
        className="
          text-3xl
          font-bold
          text-white
          mb-8
        "
      >
        Dashboard das Vistorias
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        {cards.map((card) => (

          <div
            key={card.titulo}
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
            "
          >

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                text-2xl
                font-bold
                ${card.fundo}
                ${card.cor}
              `}
            >

              {card.valor}

            </div>

            <p
              className="
                mt-5
                text-gray-300
                text-lg
              "
            >
              {card.titulo}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}