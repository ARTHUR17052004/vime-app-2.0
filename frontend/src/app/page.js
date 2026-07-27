"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  House,
  ClipboardList,
} from "lucide-react";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardStatsCard from "./components/dashboard/DashboardStatsCard";
import FinancialCard from "./components/dashboard/FinancialCard";
import OccupancyCard from "./components/dashboard/OccupancyCard";
import RecentActivities from "./components/dashboard/RecentActivities";
import QuickActions from "./components/dashboard/QuickActions";
import AlertsPanel from "./components/dashboard/AlertsPanel";
import SystemStatus from "./components/dashboard/SystemStatus";

import FadeIn from "./components/ui/FadeIn";
import Loading from "./components/ui/Loading";

import Page from "./components/ui/Page";
import PageContainer from "./components/ui/PageContainer";
import PageSection from "./components/ui/PageSection";
import PageGrid from "./components/ui/PageGrid";

import { useDashboard } from "../hooks/useDashboard";

export default function Home() {
  const {
    dados,
    loading,
    erro,
  } = useDashboard();

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <Page>
          <PageContainer>
            <motion.main
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                ease: "easeOut",
              }}
              className="space-y-8"
            >
              <FadeIn delay={0}>
                <DashboardHeader />
              </FadeIn>

              {erro && (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-xl px-6 py-4 text-yellow-300">
                  API indisponível. Exibindo dados locais.
                </div>
              )}

              {/* ========================= */}
              {/* CARDS SUPERIORES */}
              {/* ========================= */}

              <FadeIn delay={0.1}>
                <PageSection spacing="xl">
                  <PageGrid cols={4}>
                    <DashboardStatsCard
                      title="Inquilinos"
                      value={dados?.inquilinos ?? 0}
                      subtitle="Ativos"
                      icon={Users}
                    />

                    <DashboardStatsCard
                      title="Unidades"
                      value={dados?.unidades ?? 0}
                      subtitle="Ativas"
                      icon={Building2}
                    />

                    <DashboardStatsCard
                      title="Kitnets"
                      value={dados?.kitnets ?? 0}
                      subtitle="Total"
                      icon={House}
                    />

                    <DashboardStatsCard
                      title="Solicitações"
                      value={dados?.solicitacoesPendentes ?? 0}
                      subtitle="Pendentes"
                      icon={ClipboardList}
                    />
                  </PageGrid>
                </PageSection>
              </FadeIn>

              {/* ========================= */}
              {/* FINANCEIRO */}
              {/* ========================= */}

              <FadeIn delay={0.2}>
                <PageSection spacing="xxl">
                  <PageGrid
                    layout="8-4"
                    gap="relaxed"
                    className="grid-cols-12"
                  >
                    <div className="col-span-12 xl:col-span-8">
                      <FinancialCard
                        financeiro={dados?.financeiro}
                      />
                    </div>

                    <div className="col-span-12 xl:col-span-4">
                      <RecentActivities
                        atividades={dados?.atividades}
                      />
                    </div>
                  </PageGrid>
                </PageSection>
              </FadeIn>

              {/* ========================= */}
              {/* OCUPAÇÃO */}
              {/* ========================= */}

              <FadeIn delay={0.3}>
                <PageSection spacing="xxl">
                  <PageGrid
                    layout="5-7"
                    gap="relaxed"
                    className="grid-cols-12"
                  >
                    <div className="col-span-12 xl:col-span-5">
                      <OccupancyCard
                        ocupacao={dados?.ocupacao}
                      />
                    </div>

                    <div className="col-span-12 xl:col-span-7">
                      <AlertsPanel
                        alertas={dados?.alertas}
                      />
                    </div>
                  </PageGrid>
                </PageSection>
              </FadeIn>

              {/* ========================= */}
              {/* AÇÕES */}
              {/* ========================= */}

              <FadeIn delay={0.4}>
                <PageSection spacing="xxl">
                  <PageGrid
                    layout="5-7"
                    gap="relaxed"
                    className="grid-cols-12"
                  >
                    <div className="col-span-12 xl:col-span-5">
                      <QuickActions />
                    </div>

                    <div className="col-span-12 xl:col-span-7">
                      <SystemStatus />
                    </div>
                  </PageGrid>
                </PageSection>
              </FadeIn>
            </motion.main>
          </PageContainer>
        </Page>
      </MainLayout>
    </ProtectedRoute>
  );
}