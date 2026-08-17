"use client";

import Card from "../ui/Card";

import {
  Server,
  Database,
  Wallet,
  FileSignature,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

const sistemas = [
  {
    nome: "API",
    descricao: "Backend principal",
    status: "Online",
    icon: Server,
  },
  {
    nome: "Banco de Dados",
    descricao: "PostgreSQL",
    status: "Online",
    icon: Database,
  },
  {
    nome: "Asaas",
    descricao: "Integração financeira",
    status: "Online",
    icon: Wallet,
  },
  {
    nome: "Clicksign",
    descricao: "Assinatura digital",
    status: "Online",
    icon: FileSignature,
  },
  {
    nome: "WhatsApp",
    descricao: "Central de mensagens",
    status: "Online",
    icon: MessageCircle,
  },
];

export default function SystemStatus() {
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
          Sistema
        </p>

        <h2
          className="
            text-4xl
            font-bold
            text-[var(--text)]
            leading-none
          "
        >
          Status dos serviços
        </h2>

      </div>

      {/* ================= LISTA ================= */}

      <div className="flex-1 space-y-4">

        {sistemas.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.nome}
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                px-5
                py-4

                transition-all
                duration-300

                hover:border-emerald-500/30
                hover:bg-[var(--surface-2)]
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl

                    flex
                    items-center
                    justify-center

                    bg-emerald-500/10
                    border
                    border-emerald-500/20
                  "
                >

                  <Icon
                    size={20}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-[var(--text)]">
                    {item.nome}
                  </h3>

                  <p className="text-sm text-[var(--text-subtle)]">
                    {item.descricao}
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2

                  rounded-full

                  bg-emerald-500/10
                  border
                  border-emerald-500/20

                  px-3
                  py-1.5
                "
              >

                <CheckCircle2
                  size={16}
                  className="text-emerald-400"
                />

                <span
                  className="
                    text-sm
                    font-semibold
                    text-emerald-400
                  "
                >
                  {item.status}
                </span>

              </div>

            </div>

          );

        })}

      </div>

    </Card>

  );
}