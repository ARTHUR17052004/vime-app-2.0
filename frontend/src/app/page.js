import MainLayout from "./components/layout/MainLayout";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import StatsCard from "./components/dashboard/StatsCard";
import FinancialCard from "./components/dashboard/FinancialCard";
import OccupancyCard from "./components/dashboard/OccupancyCard";
import RecentActivities from "./components/dashboard/RecentActivities";

export default function Home() {
  return (
    <MainLayout>
      <DashboardHeader />

      <div className="grid grid-cols-4 gap-6 mt-10">
        <StatsCard
          title="Inquilinos"
          value="0"
        />

        <StatsCard
          title="Unidades"
          value="0"
        />

        <StatsCard
          title="Kitnets"
          value="0"
        />

        <StatsCard
          title="Solicitações"
          value="0"
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mt-10">
        <FinancialCard />

        <OccupancyCard />

        <RecentActivities />
      </div>
    </MainLayout>
  );
}