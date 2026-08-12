"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";

import Panel from "../ui/Panel";
import RevenueChart from "../charts/RevenueChart";

import { formatCurrency } from "@/utils/formatCurrency";
import { DashboardService } from "@/services/dashboard.service";

const ANO_ATUAL = new Date().getFullYear();

const ANOS = [
  ANO_ATUAL,
  ANO_ATUAL - 1,
  ANO_ATUAL - 2,
  ANO_ATUAL - 3,
  ANO_ATUAL - 4,
];

export default function FinancialCard({ financeiro }) {
  const recebido = financeiro?.recebido ?? 0;
  const pendente = financeiro?.pendente ?? 0;
  const atrasado = financeiro?.atrasado ?? 0;

  const [ano, setAno] = useState(ANO_ATUAL);
  const [receitasMensais, setReceitasMensais] = useState(undefined);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await DashboardService.receitasMensais(ano);

        if (ativo) {
          setReceitasMensais(dados);
        }
      } catch (err) {
        console.error("/dashboard/receitas-mensais", err);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [ano]);

  return (
    <Panel
      label="FINANCEIRO"
      title="Receitas mensais"
      action={
        <div className="flex items-center gap-3">

          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="
              h-10
              px-5

              rounded-xl

              bg-[#141d27]

              border
              border-white/10

              text-[13px]
              text-gray-300

              transition-all

              hover:border-emerald-500/20
            "
          >
            {ANOS.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>

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
            "
          >
            <Wallet
              size={22}
              className="text-emerald-400"
            />
          </div>

        </div>
      }
    >

      <div
        className="
          flex-1

          flex
          flex-col

          gap-8

          px-8
          pt-4
          pb-6
        "
      >

        {/* GRÁFICO */}

        <div
          className="
            rounded-2xl

            overflow-hidden
          "
        >
          <RevenueChart data={receitasMensais} />
        </div>

        {/* RESUMO */}

        <div className="grid grid-cols-3 gap-6">

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

      </div>

    </Panel>
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
        min-h-[120px]

        rounded-[18px]

        border
        border-white/[0.05]

        bg-[#161f29]

        px-8
        py-6

        flex
        flex-col
        justify-between

        transition-all
        duration-300

        hover:border-emerald-500/20
        hover:bg-[#1a2430]
      "
    >

      <p
        className="
          text-[14px]
          font-medium
          text-gray-400
        "
      >
        {titulo}
      </p>

      <h3
        className={`
          text-[32px]
          font-bold
          leading-none

          ${cores[cor].valor}
        `}
      >
        {valor}
      </h3>

      <p
        className={`
          text-[13px]

          ${cores[cor].legenda}
        `}
      >
        {legenda}
      </p>

    </div>

  );

}