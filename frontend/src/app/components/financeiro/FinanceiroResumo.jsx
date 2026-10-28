"use client";

import {
  Wallet,
  TrendingDown,
  Landmark,
  Receipt,
  TriangleAlert,
} from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";

export default function FinanceiroResumo({
  receitaPrevista,
  totalDespesas,
  vencidos,
  lucroLiquido,
  taxasBoleto,
}) {
  return (
    <PageGrid cols={5}>

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
        title="Vencidos"
        value={`R$ ${vencidos}`}
        subtitle="Receitas e despesas vencidas"
        icon={TriangleAlert}
      />

      <DashboardStatsCard
        title="Lucro Líquido"
        value={`R$ ${lucroLiquido}`}
        subtitle="Só o já pago/recebido, líquido"
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
