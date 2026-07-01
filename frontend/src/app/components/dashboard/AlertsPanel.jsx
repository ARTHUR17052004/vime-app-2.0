"use client";

import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function AlertsPanel() {

  const alertas = [

    {
      titulo: "3 contratos vencem amanhã",
      cor: "yellow",
    },

    {
      titulo: "2 aluguéis atrasados",
      cor: "red",
    },

    {
      titulo: "1 assinatura pendente",
      cor: "blue",
    },

  ];

  return (
    <Card>

      <h2 className="text-xl font-bold mb-5">
        Alertas
      </h2>

      <div className="space-y-4">

        {alertas.map((item, index) => (

          <div
            key={index}
            className="flex justify-between items-center"
          >

            <span>{item.titulo}</span>

            <Badge color={item.cor}>
              Atenção
            </Badge>

          </div>

        ))}

      </div>

    </Card>
  );
}