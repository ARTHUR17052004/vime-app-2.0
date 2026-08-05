"use client";

import Card from "../ui/Card";

import {

  AlertTriangle,

} from "lucide-react";

export default function AdministracaoAlerts({

  alerts=[],

}) {

  return (

    <Card>

      <div
        className="
          flex
          items-center
          gap-3
          mb-6
        "
      >

        <AlertTriangle
          className="
            text-yellow-400
          "
        />

        <h2
          className="
            text-xl
            font-bold
            text-white
          "
        >

          Alertas

        </h2>

      </div>

      <div className="space-y-4">

        {alerts.map((alert)=> (

          <div
            key={alert.id}
            className="
              rounded-2xl

              border

              border-yellow-500/20

              bg-yellow-500/5

              p-4
            "
          >

            <p
              className="
                text-yellow-300
                font-semibold
              "
            >

              {alert.titulo}

            </p>

            <p
              className="
                text-gray-400
                mt-1
              "
            >

              {alert.descricao}

            </p>

          </div>

        ))}

      </div>

    </Card>

  );

}