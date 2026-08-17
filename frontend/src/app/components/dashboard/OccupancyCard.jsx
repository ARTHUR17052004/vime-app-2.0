"use client";

import Card from "../ui/Card";
import OccupancyChart from "../charts/OccupancyChart";
import { Home } from "lucide-react";

export default function OccupancyCard({ ocupacao }) {

  const ocupadas = ocupacao?.ocupadas ?? 0;
  const vagas = ocupacao?.vazias ?? 0;
  const percentual = ocupacao?.percentual ?? 0;

  return (

    <Card className="h-full flex flex-col">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.30em]
              text-[var(--text-subtle)]
              mb-2
            "
          >
            Ocupação
          </p>

          <h2
            className="
              text-4xl
              font-bold
              text-[var(--text)]
              leading-none
            "
          >
            Residências por status
          </h2>

        </div>

        <div
          className="
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            bg-emerald-500/10
            border
            border-emerald-500/20
          "
        >
          <Home
            size={28}
            className="text-emerald-400"
          />
        </div>

      </div>

      {/* ================= CONTEÚDO ================= */}

      <div className="flex-1 flex items-center justify-between gap-10">

        <OccupancyChart />

        <div className="flex-1">

          <div className="space-y-5">

            <ItemLegenda
              cor="bg-emerald-400"
              titulo="Ocupadas"
              valor={ocupadas}
            />

            <ItemLegenda
              cor="bg-amber-400"
              titulo="Vagas"
              valor={vagas}
            />

            <ItemLegenda
              cor="bg-red-400"
              titulo="Manutenção"
              valor={2}
            />

          </div>

          <div
            className="
              mt-8
              pt-6
              border-t
              border-[var(--border-token)]
              flex
              items-center
              justify-between
            "
          >

            <span className="text-[var(--text-subtle)]">
              Taxa de ocupação
            </span>

            <span
              className="
                text-4xl
                font-black
                text-emerald-400
              "
            >
              {percentual}%
            </span>

          </div>

        </div>

      </div>

    </Card>

  );

}

function ItemLegenda({
  cor,
  titulo,
  valor,
}) {

  return (

    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <span
          className={`
            w-3
            h-3
            rounded-full
            ${cor}
          `}
        />

        <span className="text-[var(--text-muted)]">
          {titulo}
        </span>

      </div>

      <span
        className="
          text-3xl
          font-bold
          text-[var(--text)]
        "
      >
        {valor}
      </span>

    </div>

  );

}