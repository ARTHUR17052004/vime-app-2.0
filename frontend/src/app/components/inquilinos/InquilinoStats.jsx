"use client";

import { Users } from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";

export default function InquilinoStats({
  total,
}) {
  return (
    <PageGrid cols={1}>
      <DashboardStatsCard
        title="Inquilinos"
        value={total}
        subtitle="Total de inquilinos cadastrados"
        icon={Users}
      />
    </PageGrid>
  );
}