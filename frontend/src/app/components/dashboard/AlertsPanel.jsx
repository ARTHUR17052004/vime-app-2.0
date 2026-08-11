"use client";

import Link from "next/link";
import Card from "../ui/Card";
import {
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export default function AlertsPanel({
  alertas = [],
}) {

  const lista =
    alertas.length > 0
      ? alertas
      : [
          {
            id: 1,
            titulo: "Nenhum alerta cadastrado",
            descricao: "Tudo funcionando normalmente.",
            data: "--/--/----",
          },
        ];

  return (

    <Card className="h-full flex flex-col">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <p
            className="
              uppercase
              tracking-[0.30em]
              text-[11px]
              text-gray-400
              mb-2
            "
          >
            Avisos
          </p>

          <h2
            className="
              text-4xl
              font-bold
              text-white
              leading-none
            "
          >
            Avisos importantes
          </h2>

        </div>

        <Link
          href="/contratos"
          className="
            flex
            items-center
            gap-1
            text-sm
            text-emerald-400
            hover:text-emerald-300
            transition-all
          "
        >
          Ver todos

          <ChevronRight size={16} />

        </Link>

      </div>

      {/* ================= LISTA ================= */}

      <div className="flex-1 space-y-6">

        {lista.map((item) => (

          <div
            key={item.id}
            className="
              flex
              items-start
              justify-between
              gap-5
            "
          >

            <div className="flex gap-4">

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-emerald-500/10
                  border
                  border-emerald-500/20
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                <ShieldAlert
                  size={18}
                  className="text-emerald-400"
                />

              </div>

              <div>

                <h3
                  className="
                    text-white
                    font-semibold
                  "
                >
                  {item.titulo}
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-400
                    max-w-md
                  "
                >
                  {item.descricao}
                </p>

              </div>

            </div>

            <span
              className="
                text-sm
                text-gray-500
                whitespace-nowrap
              "
            >
              {item.data}
            </span>

          </div>

        ))}

      </div>

    </Card>

  );

}