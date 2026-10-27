"use client";

import {
  Wallet,
  TrendingDown,
  Landmark,
  Receipt,
} from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";

export default function FinanceiroResumo({
  receitaPrevista,
  totalDespesas,
  lucroLiquido,
  taxasBoleto,
}) {
  return (
    <PageGrid cols={4}>

      <DashboardStatsCard
        title="Receita Prevista"
        value={`R$ ${receitaPrevista}`}
        subtitle="Receitas cadastradas"
        icon={Wallet}
      />

      <DashboardStatsCard
        title="Despesas"
        value={`R$ ${totalDespesas}`}
        subtitle="Total de despesas"
        icon={TrendingDown}
      />

      <DashboardStatsCard
        title="Lucro Líquido"
        value={`R$ ${lucroLiquido}`}
        subtitle="Resultado financeiro"
        icon={Landmark}
      />

      <DashboardStatsCard
        title="Taxas de Boleto"
        value={`R$ ${taxasBoleto}`}
        subtitle="Valor de taxa acumulado"
        icon={Receipt}
      />

    </PageGrid>
  );
}