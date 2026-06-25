"use client";

import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Ban,
  DollarSign,
} from "lucide-react";

export default function ContratoResumo({
  contratos,
}) {
  const ativos =
    contratos.filter(
      (c) => c.status === "ATIVO"
    ).length;

  const pendentes =
    contratos.filter(
      (c) => c.status === "PENDENTE"
    ).length;

  const inadimplentes =
    contratos.filter(
      (c) => c.status === "INADIMPLENTE"
    ).length;

  const encerrados =
    contratos.filter(
      (c) => c.status === "ENCERRADO"
    ).length;

  const valorTotal =
    contratos.reduce(
      (total, item) =>
        total +
        Number(
          item.valorAluguel || 0
        ),
      0
    );

  const cards = [
    {
      titulo: "Ativos",
      valor: ativos,
      icone: CheckCircle,
      cor: "text-green-700",
      fundo: "bg-green-100",
    },

    {
      titulo: "Pendentes",
      valor: pendentes,
      icone: AlertTriangle,
      cor: "text-yellow-700",
      fundo: "bg-yellow-100",
    },

    {
      titulo: "Inadimplentes",
      valor: inadimplentes,
      icone: Ban,
      cor: "text-red-700",
      fundo: "bg-red-100",
    },

    {
      titulo: "Encerrados",
      valor: encerrados,
      icone: FileText,
      cor: "text-gray-700",
      fundo: "bg-gray-100",
    },

    {
      titulo: "Valor Total",
      valor: `R$ ${valorTotal}`,
      icone: DollarSign,
      cor: "text-blue-700",
      fundo: "bg-blue-100",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">

      {cards.map((card) => (
        <div
          key={card.titulo}
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >
          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500 text-sm">
                {card.titulo}
              </p>

              <h2 className="text-3xl font-bold mt-3">
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
                ${card.fundo}
              `}
            >
              <card.icone
                className={`w-7 h-7 ${card.cor}`}
              />
            </div>

          </div>

        </div>
      ))}

    </div>
  );
}