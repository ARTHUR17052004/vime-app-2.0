"use client";

import { useRouter } from "next/navigation";
import {
  MapPin,
  Home,
  Calendar,
  User,
  Wallet,
} from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import UnitActionsMenu from "./UnitActionsMenu";

export default function UnitCard({
  unidade,
  onView,
  onEdit,
  onDelete,
}) {
  const router = useRouter();

  const status = unidade.status || "Ativa";

  const statusColor = {
    Ativa:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",

    Manutenção:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",

    Inativa:
      "bg-red-500/15 text-red-400 border border-red-500/20",
  };

  return (
    <DashboardCard
      onClick={() =>
        router.push(`/unidades/${unidade.id}`)
      }
      className="
        h-full
        overflow-hidden

        p-8

        transition-all
        duration-300

        hover:-translate-y-2
        hover:scale-[1.01]
        hover:shadow-2xl
        hover:shadow-emerald-900/20
      "
    >
      {/* Barra superior */}

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400" />

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div>

          <h2
            className="
              text-[32px]
              xl:text-[34px]

              font-black
              tracking-tight
              leading-none

              text-[var(--text)]
            "
          >
            {unidade.nome}
          </h2>

          <span
            className={`
              inline-flex

              mt-4

              rounded-2xl

              px-4
              py-2

              text-[11px]

              uppercase
              tracking-[0.18em]

              font-bold

              ${statusColor[status]}
            `}
          >
            {status}
          </span>

        </div>

        <div
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <UnitActionsMenu
            unidade={unidade}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

      </div>

      {/* DADOS */}

      <div className="mt-8 space-y-6">

        <InfoRow
          icon={<MapPin size={18} />}
          label={`${unidade.logradouro || "-"} ${unidade.numero || ""}`}
        />

        <InfoRow
          icon={<MapPin size={18} />}
          label={`${unidade.cidade || "-"} - ${unidade.uf || "-"}`}
        />

        <InfoRow
          icon={<Wallet size={18} />}
          label={`R$ ${unidade.aluguel || "0,00"}`}
          valueClass="text-emerald-400 font-bold"
        />

      </div>

      {/* DIVISOR */}

      <div className="my-7 border-t border-[var(--border-token)]" />

      {/* RODAPÉ */}

      <div className="space-y-6">

        <InfoRow
          icon={<Home size={18} />}
          label="Kitnets"
          value={unidade.kitnets || 0}
        />

        <InfoRow
          icon={<Calendar size={18} />}
          label="Vencimento"
          value={`Dia ${unidade.vencimento || "-"}`}
        />

        <InfoRow
          icon={<User size={18} />}
          label="Locador"
          value={unidade.locador || "-"}
        />

      </div>

    </DashboardCard>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClass = "text-[var(--text)]",
}) {
  return (
    <div
      className="
        grid
        grid-cols-[44px_1fr_auto]
        items-center
        gap-4
      "
    >
      <div
        className="
          flex
          items-center
          justify-center

          w-10
          h-10

          rounded-xl

          bg-gradient-to-br
          from-emerald-500/15
          to-emerald-700/10

          border
          border-emerald-500/10

          text-emerald-400
        "
      >
        {icon}
      </div>

      <span
        className="
          text-[var(--text-muted)]
          text-[15px]
          font-medium
        "
      >
        {label}
      </span>

      {value !== undefined && (
        <span
          className={`
            text-[15px]
            font-semibold
            truncate

            ${valueClass}
          `}
        >
          {value}
        </span>
      )}

    </div>
  );
}