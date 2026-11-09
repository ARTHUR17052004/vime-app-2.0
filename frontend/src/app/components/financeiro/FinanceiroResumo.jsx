"use client";

import {
  Wallet,
  TrendingDown,
  Landmark,
  Receipt,
  TriangleAlert,
  CalendarCheck,
} from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";
import { formatarMoeda } from "../../../utils/dinheiro";

export default function FinanceiroResumo({
  receitaPrevista,
  totalDespesas,
  vencidos,
  lucroLiquido,
  taxasBoleto,
  recebidoNoMes,
}) {
  return (
    <PageGrid cols={6}>

      <DashboardStatsCard
        title="Recebido no Mês"
        value={`R$ ${formatarMoeda(recebidoNoMes)}`}
        subtitle="Zera todo dia 1 -- só pagamento reconhecido este mês"
        icon={CalendarCheck}
      />

      <DashboardStatsCard
        title="Receita Prevista"
        value={`R$ ${formatarMoeda(receitaPrevista)}`}
        subtitle="Receitas cadastradas"
        icon={Wallet}
      />

      <DashboardStatsCard
        title="Despesas"
        value={`R$ ${formatarMoeda(totalDespesas)}`}
        subtitle="Total de despesas"
        icon={TrendingDown}
      />

      <DashboardStatsCard
        title="Vencidos"
        value={`R$ ${formatarMoeda(vencidos)}`}
        subtitle="Receitas e despesas vencidas"
        icon={TriangleAlert}
      />

      <DashboardStatsCard
        title="Lucro Líquido"
        value={`R$ ${formatarMoeda(lucroLiquido)}`}
        subtitle="Só o já pago/recebido, líquido"
        icon={Landmark}
      />

      <DashboardStatsCard
        title="Taxas de Boleto"
        value={`R$ ${formatarMoeda(taxasBoleto)}`}
        subtitle="Valor de taxa acumulado"
        icon={Receipt}
      />

    </PageGrid>
  );
}
