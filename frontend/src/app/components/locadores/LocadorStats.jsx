"use client";

import {
  Users,
  Home,
  Wallet,
  Landmark,
} from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";

export default function LocadorStats({
  total = 0,
  ativos = 0,
  unidades = 0,
  contas = 0,
}) {
  return (
    <PageGrid cols={4}>

      <DashboardStatsCard
        title="Locadores"
        value={total}
        subtitle="Cadastrados"
        icon={Users}
      />

      <DashboardStatsCard
        title="Ativos"
        value={ativos}
        subtitle="Em operação"
        icon={Home}
      />

      <DashboardStatsCard
        title="Unidades"
        value={unidades}
        subtitle="Vinculadas"
        icon={Landmark}
      />

      <DashboardStatsCard
        title="Contas Asaas"
        value={contas}
        subtitle="Criadas"
        icon={Wallet}
      />

    </PageGrid>
  );
}