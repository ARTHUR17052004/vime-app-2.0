"use client";

import Link from "next/link";
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

  solicitada:
    "bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border-strong)]",

  "em cotação":
    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",

  "aguardando compra":
    "bg-sky-500/20 text-sky-300 border border-sky-500/30",

  atendida:
    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",

  rejeitada:
    "bg-red-500/20 text-red-300 border border-red-500/30",
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
              text-[var(--text-subtle)]
              mb-2
            "
          >
            Atividades
          </p>

          <h2
            className="
              text-4xl
              font-bold
              text-[var(--text)]
              leading-none
            "
          >
            Solicitações recentes
          </h2>

        </div>

        <Link
          href="/solicitacoes"
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

        </Link>

      </div>

      {/* LISTA */}

      <div className="flex-1 space-y-5">

        {lista.map((item) => {

          const Wrapper = item.link ? Link : "div";

          const wrapperProps = item.link
            ? { href: item.link }
            : {};

          return (

            <Wrapper
              key={item.id}
              {...wrapperProps}
              className="
                flex
                items-center
                justify-between
                gap-5
                -mx-2
                px-2
                py-1
                rounded-xl
                transition
                hover:bg-[var(--surface-2)]
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-[var(--surface-2)]
                    border
                    border-[var(--border-token)]
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Bell
                    size={18}
                    className="text-[var(--text-muted)]"
                  />
                </div>

                <div>

                  <p className="font-medium text-[var(--text)]">
                    {item.descricao}
                  </p>

                  <p className="text-sm text-[var(--text-subtle)] mt-1">
                    {item.link
                      ? new Date(item.data).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : item.data}
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

            </Wrapper>

          );

        })}

      </div>

    </Card>

  );

}