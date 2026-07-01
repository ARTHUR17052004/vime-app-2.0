"use client";

import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function AlertsPanel({
  alertas = [],
}) {

  return (
    <Card>

      <h2 className="text-xl font-bold mb-5">
        Alertas
      </h2>

      <div className="space-y-4">

        {alertas.length === 0 ? (

          <p className="text-gray-500">
            Nenhum alerta encontrado.
          </p>

        ) : (

          alertas.map((item, index) => (

            <div
              key={index}
              className="flex justify-between items-center"
            >

              <span>
                {item.titulo}
              </span>

              <Badge color="yellow">
                Atenção
              </Badge>

            </div>

          ))

        )}

      </div>

    </Card>
  );
}