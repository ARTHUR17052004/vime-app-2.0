"use client";

import PageGrid from "../ui/PageGrid";

import DashboardStatsCard from "../dashboard/DashboardStatsCard";

import {

  Users,

  UserCheck,

  UserX,

  Shield,

} from "lucide-react";

export default function UsuariosStats({

  total,

  ativos,

  inativos,

  administradores,

}) {

  return (

    <PageGrid cols={4}>

      <DashboardStatsCard

        title="Total"

        value={total}

        subtitle="Usuários"

        icon={Users}

      />

      <DashboardStatsCard

        title="Ativos"

        value={ativos}

        subtitle="Usuários ativos"

        icon={UserCheck}

      />

      <DashboardStatsCard

        title="Inativos"

        value={inativos}

        subtitle="Usuários bloqueados"

        icon={UserX}

      />

      <DashboardStatsCard

        title="Administradores"

        value={administradores}

        subtitle="Acesso total"

        icon={Shield}

      />

    </PageGrid>

  );

}