"use client";

import Card from "../ui/Card";

import {
  User,
  Shield,
  FileText,
  Database,
  Activity,
} from "lucide-react";

const icons = {

  usuario: User,

  auditoria: Shield,

  log: FileText,

  banco: Database,

};

export default function AdministracaoTimeline({

  items = [],

}) {

  return (

    <Card>

      <h2
        className="
          text-xl
          font-bold
          text-[var(--text)]
          mb-6
        "
      >

        Atividade do Sistema

      </h2>

      <div className="space-y-5">

        {items.map((item) => {

          const Icon =
            icons[item.tipo] ||
            Activity;

          return (

            <div
              key={item.id}
              className="
                flex
                gap-4
                items-start
              "
            >

              <div
                className="
                  w-11
                  h-11

                  rounded-xl

                  bg-emerald-500/10

                  flex

                  items-center

                  justify-center
                "
              >

                <Icon
                  size={20}
                  className="text-emerald-400"
                />

              </div>

              <div>

                <p className="text-[var(--text)]">

                  {item.titulo}

                </p>

                <p className="text-[var(--text-subtle)] text-sm">

                  {item.descricao}

                </p>

              </div>

            </div>

          );

        })}

      </div>

    </Card>

  );

}