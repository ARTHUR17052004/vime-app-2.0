"use client";

import Card from "../ui/Card";
import {
  Bell,
  ChevronRight,
} from "lucide-react";

const statusColor = {
  aberta:
    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",

  andamento:
    "bg-blue-500/20 text-blue-300 border border-blue-500/30",

  pendente:
    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",

  concluida:
    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

export default function RecentActivities({
  atividades = [],
}) {

  const lista =
    atividades.length > 0
      ? atividades
      : [
          {
            id: 1,
            descricao: "Nenhuma atividade cadastrada",
            data: "Assim que houver movimentações elas aparecerão aqui.",
            status: "",
          },
        ];

  return (

    <Card className="h-full flex flex-col">

      {/* HEADER */}

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
            Atividades
          </p>

          <h2
            className="
              text-4xl
              font-bold
              text-white
              leading-none
            "
          >
            Solicitações recentes
          </h2>

        </div>

        <button
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
          Ver todas

          <ChevronRight size={16} />

        </button>

      </div>

      {/* LISTA */}

      <div className="flex-1 space-y-5">

        {lista.map((item) => (

          <div
            key={item.id}
            className="
              flex
              items-center
              justify-between
              gap-5
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <Bell
                  size={18}
                  className="text-gray-300"
                />
              </div>

              <div>

                <p className="font-medium text-white">
                  {item.descricao}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {item.data}
                </p>

              </div>

            </div>

            {item.status && (

              <span
                className={`
                  px-4
                  py-2
                  rounded-xl
                  text-xs
                  font-semibold
                  whitespace-nowrap
                  ${statusColor[item.status.toLowerCase()]}
                `}
              >
                {item.status}
              </span>

            )}

          </div>

        ))}

      </div>

    </Card>

  );

}