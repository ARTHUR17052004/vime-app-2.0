"use client";

import {
  Landmark,
  CreditCard,
  Receipt,
  QrCode,
  History,
  CircleAlert,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";

export default function FinanceiroAsaas() {
  const cards = [
    {
      titulo: "Subcontas",
      descricao: "Gestão das subcontas dos locadores.",
      icon: Landmark,
    },
    {
      titulo: "Cobranças",
      descricao: "Boletos, PIX e cobranças automáticas.",
      icon: CreditCard,
    },
    {
      titulo: "PIX",
      descricao: "Recebimentos instantâneos.",
      icon: QrCode,
    },
    {
      titulo: "Assinaturas",
      descricao: "Cobranças recorrentes.",
      icon: Receipt,
    },
    {
      titulo: "Logs",
      descricao: "Histórico das integrações.",
      icon: History,
    },
  ];

  return (
    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-violet-500/10

              border
              border-violet-500/20

              flex
              items-center
              justify-center
            "
          >

            <Landmark className="w-6 h-6 text-violet-400" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Integração Asaas
            </h2>

            <p className="text-gray-400">
              Recursos financeiros e integrações do Asaas.
            </p>

          </div>

        </div>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">

        {cards.map((card) => (
          <div
            key={card.titulo}
            className="
              rounded-2xl

              border
              border-white/10

              bg-white/[0.02]

              p-6

              hover:bg-white/[0.04]

              transition
            "
          >

            <div className="flex items-center gap-3 mb-4">

              <card.icon className="w-6 h-6 text-violet-400" />

              <h3 className="text-xl font-semibold text-white">
                {card.titulo}
              </h3>

            </div>

            <p className="text-gray-400">
              {card.descricao}
            </p>

          </div>
        ))}

        <div
          className="
            rounded-2xl

            border
            border-white/10

            bg-white/[0.02]

            p-6
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <CircleAlert className="w-6 h-6 text-yellow-400" />

            <h3 className="text-xl font-semibold text-white">
              Status
            </h3>

          </div>

          <Badge color="yellow">
            Em Desenvolvimento
          </Badge>

        </div>

      </div>

    </Table>
  );
}