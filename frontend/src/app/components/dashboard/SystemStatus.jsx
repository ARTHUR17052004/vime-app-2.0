"use client";

import Badge from "../ui/Badge";
import Card from "../ui/Card";

export default function SystemStatus() {

  const sistemas = [

    {
      nome: "API",
      status: "Online",
      color: "green",
    },

    {
      nome: "Banco",
      status: "Online",
      color: "green",
    },

    {
      nome: "Asaas",
      status: "Online",
      color: "green",
    },

    {
      nome: "Clicksign",
      status: "Online",
      color: "green",
    },

    {
      nome: "WhatsApp",
      status: "Online",
      color: "green",
    },

  ];

  return (
    <Card>

      <h2 className="text-xl font-bold mb-5">
        Status do Sistema
      </h2>

      <div className="space-y-4">

        {sistemas.map((item) => (

          <div
            key={item.nome}
            className="flex justify-between items-center"
          >

            <span className="text-gray-700">
              {item.nome}
            </span>

            <Badge color={item.color}>
              {item.status}
            </Badge>

          </div>

        ))}

      </div>

    </Card>
  );
}