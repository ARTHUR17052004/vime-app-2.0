"use client";

import {
  Wallet,
  TrendingDown,
  Landmark,
} from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";

export default function FinanceiroResumo({
  receitaPrevista,
  totalDespesas,
  lucroLiquido,
}) {
  return (
    <PageGrid cols={3}>

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

    </PageGrid>
  );
}