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

        transition-all
        duration-300

        hover:-translate-y-1
      "

    >

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div>

          <h2
            className="
              text-3xl

              font-bold

              text-white
            "
          >
            {unidade.nome}
          </h2>

          <span

            className={`
              inline-flex

              mt-3

              rounded-full

              px-5
              py-2.1

              text-xs

              font-bold

              ${statusColor[status]}

            `}

          >

            {status}

          </span>

        </div>

        <div
          onClick={(e) => e.stopPropagation()}
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

      <div className="mt-8 space-y-8">

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

      <div className="my-7 border-t border-white/5" />

      {/* RODAPÉ */}

      <div className="space-y-10">

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

  valueClass = "text-white",

}) {

  return (

    <div
      className="
        grid
        grid-cols-[48px_1fr_200px]
        items-center
        gap-4
      "
    >

      <div
        className="
          flex
          items-center
          justify-center

          w-11
          h-11

          rounded-xl

          bg-emerald-500/10

          text-emerald-400
        "
      >
        {icon}
      </div>

      <span
        className="
          text-gray-300
          text-[17px]
          font-medium
        "
      >
        {label}
      </span>

      {value !== undefined && (

        <span
          className={`
            ml-12
            text-[17px]
            font-bold
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