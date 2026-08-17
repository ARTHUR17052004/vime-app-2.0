"use client";

const formatarValor = (valor) => {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const somarPorStatus = (transacoes, status) =>
  transacoes
    .filter((item) => item.status === status)
    .reduce((total, item) => total + Number(item.valor || 0), 0);

export default function AsaasResumoCards({ transacoes = [] }) {

  const cards = [

    {
      titulo: "Recebido",
      valor: formatarValor(somarPorStatus(transacoes, "PAGA")),
      cor: "bg-green-600",
    },

    {
      titulo: "Pendente",
      valor: formatarValor(somarPorStatus(transacoes, "PENDENTE")),
      cor: "bg-yellow-500",
    },

    {
      titulo: "Atrasado",
      valor: formatarValor(somarPorStatus(transacoes, "ATRASADA")),
      cor: "bg-red-600",
    },

    {
      titulo: "Cancelado",
      valor: formatarValor(somarPorStatus(transacoes, "CANCELADA")),
      cor: "bg-gray-700",
    },

  ];

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] overflow-hidden"
        >

          <div
            className={`${card.cor} h-2`}
          />

          <div className="p-6">

            <p className="text-[var(--text-subtle)] text-sm">
              {card.titulo}
            </p>

            <h2 className="text-3xl font-bold text-[var(--text)] mt-3">
              {card.valor}
            </h2>

          </div>

        </div>

      ))}

    </div>

  );
}
