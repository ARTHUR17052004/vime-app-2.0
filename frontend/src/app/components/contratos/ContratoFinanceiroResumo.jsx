"use client";

import {
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function ContratoFinanceiroResumo({
  contrato,
}) {

  const valorAluguel =
    Number(
      contrato?.valorAluguel || 0
    );

  const receitaAnual =
    valorAluguel * 12;

  const hoje = new Date();

  const dataFim =
    contrato?.dataFim
      ? new Date(
          contrato.dataFim
        )
      : hoje;

  const mesesRestantes =
    Math.max(
      0,
      Math.ceil(
        (dataFim - hoje) /
          (1000 * 60 * 60 * 24 * 30)
      )
    );

  const cards = [
    {
      titulo: "Aluguel",
      valor: `R$ ${valorAluguel}`,
      icone: DollarSign,
      cor: "bg-green-100 text-green-700",
    },

    {
      titulo: "Receita Anual",
      valor: `R$ ${receitaAnual}`,
      icone: TrendingUp,
      cor: "bg-blue-100 text-blue-700",
    },

    {
      titulo: "Meses Restantes",
      valor: mesesRestantes,
      icone: Calendar,
      cor: "bg-yellow-100 text-yellow-700",
    },

    {
      titulo: "Status",
      valor: contrato?.status,
      icone: FileText,
      cor: "bg-gray-100 text-gray-700",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

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

              <h2 className="text-2xl font-bold mt-3">
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
              <card.icone className="w-7 h-7" />
            </div>

          </div>

        </div>

      ))}

    </div>
  );
}