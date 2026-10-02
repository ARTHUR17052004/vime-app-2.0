"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  House,
  ClipboardList,
  DoorOpen,
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
import DashboardMobile from "./components/dashboard/mobile/DashboardMobile";

import FadeIn from "./components/ui/FadeIn";
import Loading from "./components/ui/Loading";
import AnimatedNumber from "./components/ui/AnimatedNumber";

import Page from "./components/ui/Page";
import PageContainer from "./components/ui/PageContainer";
import PageSection from "./components/ui/PageSection";
import PageGrid from "./components/ui/PageGrid";

import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { usePermissao } from "../hooks/usePermissao";
import SemPermissao from "./components/ui/SemPermissao";

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardConteudo />
    </ProtectedRoute>
  );
}

function DashboardConteudo() {
  const {
    dados,
    loading,
    erro,
    ultimaAtualizacao,
  } = useDashboard();

  const { usuario } = useAuth();
  const isMobile = useIsMobile();
  const primeiroNome = usuario?.nome?.split(" ")[0] || "Visitante";

  // Cada pedaço do Dashboard tem a sua própria permissão (Administração >
  // Permissões > Dashboard) -- um perfil pode ver a tela e não ver, por
  // exemplo, o gráfico financeiro. Vale tanto aqui quanto no mobile
  // (DashboardMobile usa os mesmos "dados", vindos da mesma API).
  const podeDashboard = usePermissao("dashboard.visualizar");
  const podeIndicadores = usePermissao("dashboard.indicadores");
  const podeFinanceiro = usePermissao("dashboard.financeiro");
  const podeOcupacao = usePermissao("dashboard.ocupacao");
  const podeAtividades = usePermissao("dashboard.atividades");
  const podeAlertas = usePermissao("dashboard.alertas");
  const podeAcoesRapidas = usePermissao("dashboard.acoesRapidas");
  const podeStatusSistema = usePermissao("dashboard.statusSistema");

  if (!podeDashboard) {
    return (
      <MainLayout>
        <SemPermissao />
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (isMobile) {
    return (
      <MainLayout>
        <DashboardMobile
          dados={dados}
          primeiroNome={primeiroNome}
          podeIndicadores={podeIndicadores}
          podeFinanceiro={podeFinanceiro}
          podeOcupacao={podeOcupacao}
          podeAlertas={podeAlertas}
        />
      </MainLayout>
    );
  }

  return (
    <>
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
                <DashboardHeader
                  usuario={primeiroNome}
                  perfil={usuario?.perfil}
                  ultimaAtualizacao={
                    ultimaAtualizacao
                      ? ultimaAtualizacao.toLocaleTimeString("pt-BR")
                      : null
                  }
                />
              </FadeIn>

              {erro && (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-xl px-6 py-4 text-yellow-300">
                  API indisponível. Exibindo dados locais.
                </div>
              )}

              {/* ========================= */}
              {/* CARDS SUPERIORES */}
              {/* ========================= */}

              {(podeIndicadores || podeOcupacao) && (
                <FadeIn delay={0.1}>
                  <PageSection spacing="xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-5">

                      {podeIndicadores && (
                        <>
                          <DashboardStatsCard
                            compact
                            title="Residências"
                            value={<AnimatedNumber value={dados?.unidades ?? 0} />}
                            subtitle="Ativas"
                            icon={Building2}
                          />

                          <DashboardStatsCard
                            compact
                            title="Kitnets"
                            value={<AnimatedNumber value={dados?.kitnets ?? 0} />}
                            subtitle="Total"
                            icon={House}
                          />

                          <DashboardStatsCard
                            compact
                            title="Inquilinos"
                            value={<AnimatedNumber value={dados?.inquilinos ?? 0} />}
                            subtitle="Ativos"
                            icon={Users}
                          />
                        </>
                      )}

                      {podeOcupacao && (
                        <DashboardStatsCard
                          compact
                          title="Vazias"
                          value={<AnimatedNumber value={dados?.ocupacao?.vazias ?? 0} />}
                          subtitle="Kitnets"
                          icon={DoorOpen}
                        />
                      )}

                      {podeIndicadores && (
                        <DashboardStatsCard
                          compact
                          title="Solicitações"
                          value={<AnimatedNumber value={dados?.solicitacoesPendentes ?? 0} />}
                          subtitle="Pendentes"
                          icon={ClipboardList}
                        />
                      )}

                    </div>
                  </PageSection>
                </FadeIn>
              )}

              {/* ========================= */}
              {/* FINANCEIRO */}
              {/* ========================= */}

              {(podeFinanceiro || podeAtividades) && (
                <FadeIn delay={0.2}>
                  <PageSection spacing="xxl">
                    <PageGrid
                      layout="8-4"
                      gap="relaxed"
                      className="grid-cols-12"
                    >
                      {podeFinanceiro && (
                        <div className="col-span-12 xl:col-span-8">
                          <FinancialCard
                            financeiro={dados?.financeiro}
                          />
                        </div>
                      )}

                      {podeAtividades && (
                        <div className="col-span-12 xl:col-span-4">
                          <RecentActivities
                            atividades={dados?.atividades}
                          />
                        </div>
                      )}
                    </PageGrid>
                  </PageSection>
                </FadeIn>
              )}

              {/* ========================= */}
              {/* OCUPAÇÃO */}
              {/* ========================= */}

              {(podeOcupacao || podeAlertas) && (
                <FadeIn delay={0.3}>
                  <PageSection spacing="xxl">
                    <PageGrid
                      layout="5-7"
                      gap="relaxed"
                      className="grid-cols-12"
                    >
                      {podeOcupacao && (
                        <div className="col-span-12 xl:col-span-5">
                          <OccupancyCard
                            ocupacao={dados?.ocupacao}
                          />
                        </div>
                      )}

                      {podeAlertas && (
                        <div className="col-span-12 xl:col-span-7">
                          <AlertsPanel
                            alertas={dados?.alertas}
                          />
                        </div>
                      )}
                    </PageGrid>
                  </PageSection>
                </FadeIn>
              )}

              {/* ========================= */}
              {/* AÇÕES */}
              {/* ========================= */}

              {(podeAcoesRapidas || podeStatusSistema) && (
                <FadeIn delay={0.4}>
                  <PageSection spacing="xxl">
                    <PageGrid
                      layout="5-7"
                      gap="relaxed"
                      className="grid-cols-12"
                    >
                      {podeAcoesRapidas && (
                        <div className={podeStatusSistema ? "col-span-12 xl:col-span-5" : "col-span-12"}>
                          <QuickActions />
                        </div>
                      )}

                      {podeStatusSistema && (
                        <div className={podeAcoesRapidas ? "col-span-12 xl:col-span-7" : "col-span-12"}>
                          <SystemStatus />
                        </div>
                      )}
                    </PageGrid>
                  </PageSection>
                </FadeIn>
              )}
            </motion.main>
          </PageContainer>
        </Page>
      </MainLayout>
    </>
  );
}