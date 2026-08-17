"use client";

import Link from "next/link";
import Card from "../ui/Card";

import {
  Building2,
  UserPlus,
  FileSignature,
  ClipboardPlus,
} from "lucide-react";

const actions = [
  {
    title: "Nova Residência",
    icon: Building2,
    href: "/unidades",
  },
  {
    title: "Novo Inquilino",
    icon: UserPlus,
    href: "/inquilinos",
  },
  {
    title: "Novo Contrato",
    icon: FileSignature,
    href: "/contratos",
  },
  {
    title: "Nova Solicitação",
    icon: ClipboardPlus,
    href: "/solicitacoes",
  },
];

export default function QuickActions() {
  return (

    <Card className="h-full flex flex-col">

      {/* ================= HEADER ================= */}

      <div className="mb-8">

        <p
          className="
            uppercase
            tracking-[0.30em]
            text-[11px]
            text-[var(--text-subtle)]
            mb-2
          "
        >
          Ações
        </p>

        <h2
          className="
            text-4xl
            font-bold
            text-[var(--text)]
            leading-none
          "
        >
          Ações rápidas
        </h2>

      </div>

      {/* ================= BOTÕES ================= */}

      <div className="grid grid-cols-2 gap-5 flex-1">

        {actions.map((item) => {

          const Icon = item.icon;

          return (

            <Link
              key={item.title}
              href={item.href}
              className="
                group
                rounded-2xl
                border
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                p-5

                transition-all
                duration-300

                hover:bg-emerald-500/10
                hover:border-emerald-500/30
                hover:-translate-y-1
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-xl

                  flex
                  items-center
                  justify-center

                  bg-emerald-500/10
                  border
                  border-emerald-500/20

                  mb-4

                  transition-all
                  duration-300

                  group-hover:scale-110
                "
              >

                <Icon
                  size={24}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

              </div>

              <h3
                className="
                  text-left
                  text-sm
                  font-semibold
                  text-[var(--text)]
                "
              >
                {item.title}
              </h3>

            </Link>

          );

        })}

      </div>

    </Card>

  );
}