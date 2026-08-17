"use client";

import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";

export default function ContratoResumo({
  contratos = [],
}) {
  const ativos = contratos.filter(
    (c) => c.status === "ATIVO"
  ).length;

  const pendentes = contratos.filter(
    (c) => c.status === "PENDENTE"
  ).length;

  const encerrados = contratos.filter(
    (c) => c.status === "ENCERRADO"
  ).length;

  const valorTotal = contratos.reduce(
    (total, item) =>
      total + Number(item.valorAluguel || 0),
    0
  );

  const cards = [
    {
      titulo: "Ativos",
      valor: ativos,
      icon: CheckCircle2,
      color: "emerald",
    },
    {
      titulo: "Pendentes",
      valor: pendentes,
      icon: AlertTriangle,
      color: "yellow",
    },
    {
      titulo: "Encerrados",
      valor: encerrados,
      icon: FileText,
      color: "gray",
    },
    {
      titulo: "Valor Total",
      valor: `R$ ${valorTotal.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      color: "emerald",
    },
  ];

  const colors = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "text-yellow-400",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
    },
    gray: {
      bg: "bg-[var(--surface-2)]",
      border: "border-[var(--border-token)]",
      text: "text-[var(--text-muted)]",
    },
  };

  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      "
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <DashboardCard
            key={card.titulo}
            className="
              hover:-translate-y-1
              transition-all
              duration-300
            "
          >
            <div className="flex items-center justify-between">

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.18em]
                    text-[var(--text-subtle)]
                    font-semibold
                  "
                >
                  {card.titulo}
                </p>

                <h2
                  className="
                    mt-3
                    text-4xl
                    font-black
                    text-[var(--text)]
                  "
                >
                  {card.valor}
                </h2>

              </div>

              <div
                className={`
                  w-16
                  h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  border
                  ${colors[card.color].bg}
                  ${colors[card.color].border}
                `}
              >
                <Icon
                  className={`
                    w-8
                    h-8
                    ${colors[card.color].text}
                  `}
                />
              </div>

            </div>

          </DashboardCard>
        );
      })}
    </div>
  );
}