"use client";

import { CalendarClock } from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";

export default function ContratoProximosVencimentos({
  contratos,
}) {
  const contratosVencendo = contratos
    .filter((c) => c.status === "ATIVO")
    .sort(
      (a, b) =>
        Number(a.diaVencimento) -
        Number(b.diaVencimento)
    );

  return (
    <DashboardCard>

      <div className="flex items-center gap-4 mb-8">

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
          <CalendarClock
            size={28}
            className="text-emerald-400"
          />
        </div>

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-white
            "
          >
            Próximos Vencimentos
          </h2>

          <p className="text-gray-400">
            Contratos ativos ordenados por vencimento
          </p>

        </div>

      </div>

      {contratosVencendo.length === 0 ? (

        <div
          className="
            py-16

            text-center

            text-gray-500
          "
        >
          Nenhum contrato ativo.
        </div>

      ) : (

        <div className="space-y-5">

          {contratosVencendo.map((contrato) => (

            <div
              key={contrato.id}
              className="
                flex
                items-center
                justify-between

                rounded-2xl

                border
                border-white/5

                bg-white/[0.02]

                px-6
                py-5

                transition-all
                duration-300

                hover:bg-white/[0.05]
              "
            >

              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {contrato.inquilinoNome}
                </h3>

                <p className="text-gray-400">
                  {contrato.unidadeNome}
                </p>

              </div>

              <div className="text-right">

                <p
                  className="
                    text-xl
                    font-bold
                    text-emerald-400
                  "
                >
                  R$ {contrato.valorAluguel}
                </p>

                <p className="text-gray-400">
                  Dia {contrato.diaVencimento}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </DashboardCard>
  );
}