"use client";

import {
  Shield,
  Users,
  KeyRound,
  Activity,
  FileText,
  History,
} from "lucide-react";

import DashboardStatsCard from "../dashboard/DashboardStatsCard";
import PageGrid from "../ui/PageGrid";

export default function AdministracaoStats({

  usuarios = 0,

  perfis = 0,

  permissoes = 0,

  sessoes = 0,

  auditorias = 0,

  logs = 0,

}) {

  return (

    <PageGrid cols={3}>

      <DashboardStatsCard
        title="Usuários"
        value={usuarios}
        subtitle="Usuários cadastrados"
        icon={Users}
      />

      <DashboardStatsCard
        title="Perfis"
        value={perfis}
        subtitle="Perfis de acesso"
        icon={Shield}
      />

      <DashboardStatsCard
        title="Permissões"
        value={permissoes}
        subtitle="Permissões configuradas"
        icon={KeyRound}
      />

      <DashboardStatsCard
        title="Sessões"
        value={sessoes}
        subtitle="Usuários online"
        icon={Activity}
      />

      <DashboardStatsCard
        title="Auditorias"
        value={auditorias}
        subtitle="Registros do dia"
        icon={History}
      />

      <DashboardStatsCard
        title="Logs"
        value={logs}
        subtitle="Eventos registrados"
        icon={FileText}
      />

    </PageGrid>

  );

}