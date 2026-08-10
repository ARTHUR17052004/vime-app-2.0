"use client";

import MainLayout from "../components/layout/MainLayout";

import NotificacoesHeader from "../components/notificacoes/NotificacoesHeader";
import DashboardCards from "../components/notificacoes/DashboardCards";

import CanaisCard from "../components/notificacoes/CanaisCard";
import WhatsAppCard from "../components/notificacoes/WhatsAppCard";
import EmailCard from "../components/notificacoes/EmailCard";
import SistemaCard from "../components/notificacoes/SistemaCard";
import PushCard from "../components/notificacoes/PushCard";
import TemplatesCard from "../components/notificacoes/TemplatesCard";
import HorariosCard from "../components/notificacoes/HorariosCard";
import EventosCard from "../components/notificacoes/EventosCard";
import LogsCard from "../components/notificacoes/LogsCard";
import TesteEnvioCard from "../components/notificacoes/TesteEnvioCard";

import AcessoRapido from "../components/notificacoes/AcessoRapido";

export default function NotificacoesPage() {
  return (
    <MainLayout>

      <div className="space-y-6">

        <NotificacoesHeader />

        <DashboardCards />

        <div className="grid gap-6 xl:grid-cols-3">

          <div className="space-y-6 xl:col-span-2">

            <CanaisCard />

            <WhatsAppCard />

            <EmailCard />

            <SistemaCard />

            <PushCard />

            <TemplatesCard />

            <HorariosCard />

            <EventosCard />

            <LogsCard />

            <TesteEnvioCard />

          </div>

          <div>

            <div className="sticky top-24">

              <AcessoRapido />

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}