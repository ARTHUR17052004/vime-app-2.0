"use client";

import { useRouter } from "next/navigation";
import {
  House,
  Ruler,
  Wallet,
  DoorOpen,
} from "lucide-react";

import Card from "../ui/Card";
import KitnetActionsMenu from "./KitnetActionsMenu";

export default function KitnetCard({
  kitnet,
  onEdit,
  onDelete,
}) {

  const router = useRouter();

  return (

    <Card

      onClick={() =>
        router.push(`/kitnets/${kitnet.id}`)
      }

      className="
        cursor-pointer

        transition-all

        hover:-translate-y-1
      "

    >

      <div className="flex items-start justify-between">

        <div>

          <h2
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            {kitnet.nome}
          </h2>

          <span

            className={`

              inline-flex

              mt-3

              rounded-full

              px-3
              py-1

              text-xs

              font-semibold

              ${
                kitnet.status === "Disponível"

                  ? "bg-emerald-500/15 text-emerald-400"

                  : kitnet.status === "Ocupada"

                  ? "bg-sky-500/15 text-sky-400"

                  : "bg-yellow-500/15 text-yellow-400"

              }

            `}

          >

            {kitnet.status}

          </span>

        </div>

        <div
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          <KitnetActionsMenu

            kitnet={kitnet}

            onEdit={onEdit}

            onDelete={onDelete}

          />

        </div>

      </div>

      <div
        className="
          mt-8

          space-y-4
        "
      >

        <Info
          icon={<House size={17} />}
          label="Unidade"
          value={kitnet.unidadeNome}
        />

        <Info
          icon={<DoorOpen size={17} />}
          label="Número"
          value={kitnet.numero}
        />

        <Info
          icon={<Ruler size={17} />}
          label="Metragem"
          value={`${kitnet.metragem} m²`}
        />

        <Info
          icon={<Wallet size={17} />}
          label="Aluguel"
          value={`R$ ${kitnet.aluguel}`}
        />

      </div>

    </Card>

  );

}

function Info({

  icon,

  label,

  value,

}) {

  return (

    <div
      className="
        flex

        items-center

        justify-between

        border-b

        border-white/5

        pb-3
      "
    >

      <div
        className="
          flex
          items-center
          gap-3

          text-gray-400
        "
      >

        {icon}

        <span>

          {label}

        </span>

      </div>

      <span
        className="
          font-semibold

          text-white
        "
      >

        {value || "-"}

      </span>

    </div>

  );

}