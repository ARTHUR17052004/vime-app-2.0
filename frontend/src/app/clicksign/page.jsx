"use client";

import MainLayout from "../components/layout/MainLayout";

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

        <ClicksignHeader />

        <DashboardCards />

        {/* DOCUMENTOS + LATERAL */}

        <div className="grid gap-6 xl:grid-cols-3">

          <div className="xl:col-span-2">

            <DocumentosCard />

          </div>

          <div className="space-y-6">

            <PendenciasCard />

            <AcessoRapido />

          </div>

        </div>

        {/* SEGUNDA LINHA */}

        <div className="grid gap-6 xl:grid-cols-2">

          <TemplatesCard />

          <TokenCard />

        </div>

        {/* TERCEIRA LINHA */}

        <div className="grid gap-6 xl:grid-cols-2">

          <HistoricoCard />

          <AssinantesCard />

        </div>

      </div>

    </MainLayout>
  );
}