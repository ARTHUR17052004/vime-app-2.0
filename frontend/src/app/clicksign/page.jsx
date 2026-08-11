"use client";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";

import ClicksignHeader from "../components/clicksign/ClicksignHeader";
import DashboardCards from "../components/clicksign/DashboardCards";

import DocumentosCard from "../components/clicksign/DocumentosCard";
import PendenciasCard from "../components/clicksign/PendenciasCard";
import TemplatesCard from "../components/clicksign/TemplatesCard";
import HistoricoCard from "../components/clicksign/HistoricoCard";
import TokenCard from "../components/clicksign/TokenCard";
import AssinantesCard from "../components/clicksign/AssinantesCard";
import AcessoRapido from "../components/clicksign/AcessoRapido";

export default function ClicksignPage() {
  return (
    <MainLayout>

      <div className="space-y-6">

        <FadeIn delay={0}>

          <ClicksignHeader />

        </FadeIn>

        <FadeIn delay={0.10}>

          <DashboardCards />

        </FadeIn>

        {/* DOCUMENTOS + LATERAL */}

        <FadeIn delay={0.20}>

          <div className="grid gap-6 xl:grid-cols-3">

            <div className="xl:col-span-2">

              <DocumentosCard />

            </div>

            <div className="space-y-6">

              <PendenciasCard />

              <AcessoRapido />

            </div>

          </div>

        </FadeIn>

        {/* SEGUNDA LINHA */}

        <FadeIn delay={0.30}>

          <div className="grid gap-6 xl:grid-cols-2">

            <TemplatesCard />

            <TokenCard />

          </div>

        </FadeIn>

        {/* TERCEIRA LINHA */}

        <FadeIn delay={0.40}>

          <div className="grid gap-6 xl:grid-cols-2">

            <HistoricoCard />

            <AssinantesCard />

          </div>

        </FadeIn>

      </div>

    </MainLayout>
  );
}