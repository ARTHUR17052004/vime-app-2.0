export default function AsaasResumoCards() {

  const cards = [

    {
      titulo: "Recebido",
      valor: "R$ 18.540,00",
      cor: "bg-green-600",
    },

    {
      titulo: "Pendente",
      valor: "R$ 4.280,00",
      cor: "bg-yellow-500",
    },

    {
      titulo: "Atrasado",
      valor: "R$ 1.350,00",
      cor: "bg-red-600",
    },

    {
      titulo: "Cancelado",
      valor: "R$ 650,00",
      cor: "bg-gray-700",
    },

  ];

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] overflow-hidden"
        >

          <div
            className={`${card.cor} h-2`}
          />

          <div className="p-6">

            <p className="text-gray-400 text-sm">
              {card.titulo}
            </p>

            <h2 className="text-3xl font-bold text-white mt-3">
              {card.valor}
            </h2>

          </div>

        </div>

      ))}

    </div>

  );
}