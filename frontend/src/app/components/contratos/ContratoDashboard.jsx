"use client";

import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Ban,
  DollarSign,
} from "lucide-react";

export default function ContratoDashboard({
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
      cor: "bg-green-100",
      texto: "text-green-700",
      icone: CheckCircle,
    },

    {
      titulo: "Pendentes",
      valor: pendentes,
      cor: "bg-yellow-100",
      texto: "text-yellow-700",
      icone: AlertTriangle,
    },

    {
      titulo: "Inadimplentes",
      valor: inadimplentes,
      cor: "bg-red-100",
      texto: "text-red-700",
      icone: Ban,
    },

    {
      titulo: "Encerrados",
      valor: encerrados,
      cor: "bg-gray-100",
      texto: "text-gray-700",
      icone: FileText,
    },

    {
      titulo: "Valor Total",
      valor: `R$ ${valorTotal}`,
      cor: "bg-blue-100",
      texto: "text-blue-700",
      icone: DollarSign,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="bg-white rounded-3xl shadow p-6"
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
                ${card.cor}
              `}
            >
              <card.icone
                className={`w-7 h-7 ${card.texto}`}
              />
            </div>

          </div>

        </div>

      ))}

    </div>
  );
}