"use client";

import {
  ClipboardList,
  Clock,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SolicitacaoStats({
  solicitacoes,
}) {
  const cards = [
    {
      titulo: "Solicitadas",
      valor: solicitacoes.filter(
        (s) => s.status === "SOLICITADA"
      ).length,
      icone: ClipboardList,
      cor: "text-blue-700",
      fundo: "bg-blue-100",
    },

    {
      titulo: "Em Cotação",
      valor: solicitacoes.filter(
        (s) => s.status === "EM COTAÇÃO"
      ).length,
      icone: Clock,
      cor: "text-yellow-700",
      fundo: "bg-yellow-100",
    },

    {
      titulo: "Aguardando Compra",
      valor: solicitacoes.filter(
        (s) =>
          s.status ===
          "AGUARDANDO COMPRA"
      ).length,
      icone: ShoppingCart,
      cor: "text-orange-700",
      fundo: "bg-orange-100",
    },

    {
      titulo: "Atendidas",
      valor: solicitacoes.filter(
        (s) => s.status === "ATENDIDA"
      ).length,
      icone: CheckCircle,
      cor: "text-green-700",
      fundo: "bg-green-100",
    },

    {
      titulo: "Rejeitadas",
      valor: solicitacoes.filter(
        (s) => s.status === "REJEITADA"
      ).length,
      icone: XCircle,
      cor: "text-red-700",
      fundo: "bg-red-100",
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