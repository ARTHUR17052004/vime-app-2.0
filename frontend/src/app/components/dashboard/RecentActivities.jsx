"use client";

import Card from "../ui/Card";

export default function RecentActivities() {

  const atividades = [

    "João pagou aluguel",

    "Maria assinou contrato",

    "PIX recebido",

    "Contrato renovado",

    "WhatsApp enviado",

  ];

  return (
    <Card>

      <h2 className="text-xl font-bold mb-5">
        Atividades Recentes
      </h2>

      <div className="space-y-3">

        {atividades.map((item, index) => (

          <div
            key={index}
            className="border rounded-xl p-3 hover:bg-gray-50"
          >
            {item}
          </div>

        ))}

      </div>

    </Card>
  );
}