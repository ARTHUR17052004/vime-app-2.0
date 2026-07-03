"use client";

import Card from "../ui/Card";
import RevenueChart from "../charts/RevenueChart";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function FinancialCard({ financeiro }) {
  const recebido = financeiro?.recebido ?? 0;
  const pendente = financeiro?.pendente ?? 0;
  const atrasado = financeiro?.atrasado ?? 0;

  return (
    <Card
      className="
        h-full
        flex
        flex-col
      "
    >
      {/* ========================================= */}
      {/* HEADER                                    */}
      {/* ========================================= */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.32em]
              text-gray-400
              mb-2
            "
          >
            Financeiro
          </p>

          <h2
            className="
              text-[36px]
              font-bold
              leading-none
              text-white
            "
          >
            Receitas nos últimos 6 meses
          </h2>

        </div>

        <div className="flex items-center gap-4">

          <button
            className="
              h-10
              px-5

              rounded-2xl

              bg-white/5

              border
              border-white/10

              text-sm
              text-gray-300

              transition-all

              hover:border-emerald-500/30
              hover:bg-white/8
            "
          >
            Este ano ▼
          </button>

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
            <Wallet
              size={26}
              strokeWidth={1.7}
              className="text-emerald-400"
            />
          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* GRÁFICO                                   */}
      {/* ========================================= */}

      <div className="flex-1 min-h-[320px]">

        <RevenueChart />

      </div>

      {/* ========================================= */}
      {/* RESUMO                                    */}
      {/* ========================================= */}

      <div className="grid grid-cols-3 gap-6 mt-10">

        <ResumoFinanceiro
          titulo="Recebido"
          valor={formatCurrency(recebido)}
          legenda="Valor recebido"
          cor="emerald"
        />

        <ResumoFinanceiro
          titulo="Pendente"
          valor={formatCurrency(pendente)}
          legenda="A receber"
          cor="yellow"
        />

        <ResumoFinanceiro
          titulo="Atrasado"
          valor={formatCurrency(atrasado)}
          legenda="Em atraso"
          cor="red"
        />

      </div>

    </Card>
  );
}

function ResumoFinanceiro({
  titulo,
  valor,
  legenda,
  cor,
}) {

  const cores = {
    emerald: {
      valor: "text-emerald-400",
      legenda: "text-emerald-300",
    },

    yellow: {
      valor: "text-yellow-400",
      legenda: "text-yellow-300",
    },

    red: {
      valor: "text-red-400",
      legenda: "text-red-300",
    },
  };

  return (
    <div
      className="
        rounded-[18px]

        border
        border-white/5

        bg-white/5

        p-6

        transition-all
        duration-300

        hover:bg-white/[0.07]
        hover:border-white/10
      "
    >

      <p className="text-sm text-gray-400">
        {titulo}
      </p>

      <h3
        className={`
          mt-3

          text-[34px]
          leading-none
          font-bold

          ${cores[cor].valor}
        `}
      >
        {valor}
      </h3>

      <p
        className={`
          mt-2
          text-xs

          ${cores[cor].legenda}
        `}
      >
        {legenda}
      </p>

    </div>
  );
}