"use client";

import MainLayout from "./components/layout/MainLayout";

import DashboardHeader from "./components/dashboard/DashboardHeader";
import StatsCard from "./components/dashboard/StatsCard";
import FinancialCard from "./components/dashboard/FinancialCard";
import OccupancyCard from "./components/dashboard/OccupancyCard";
import RecentActivities from "./components/dashboard/RecentActivities";
import QuickActions from "./components/dashboard/QuickActions";
import AlertsPanel from "./components/dashboard/AlertsPanel";
import SystemStatus from "./components/dashboard/SystemStatus";

import Loading from "./components/ui/Loading";

import { useDashboard } from "../hooks/useDashboard";

export default function Home() {
  const { dados, loading, erro } = useDashboard();

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DashboardHeader />

      {erro && (
        <div className="mb-6 rounded-xl bg-yellow-100 border border-yellow-300 p-4 text-yellow-800">
          API indisponível. Exibindo dados locais.
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 mt-8">
        <StatsCard
          title="Inquilinos"
          value={dados?.inquilinos ?? 0}
        />

        <StatsCard
          title="Unidades"
          value={dados?.unidades ?? 0}
        />

        <StatsCard
          title="Kitnets"
          value={dados?.kitnets ?? 0}
        />

        <StatsCard
          title="Solicitações"
          value={dados?.solicitacoesPendentes ?? 0}
        />
      </div>

     <div className="grid grid-cols-3 gap-6 mt-8">
        <FinancialCard
          financeiro={dados?.financeiro}
        />

        <OccupancyCard
          ocupacao={dados?.ocupacao}
        />

        <RecentActivities
          atividades={dados?.atividades}
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <QuickActions />

        <AlertsPanel
          alertas={dados?.alertas}
        />

        <SystemStatus />
      </div>

    </MainLayout>
  );
}