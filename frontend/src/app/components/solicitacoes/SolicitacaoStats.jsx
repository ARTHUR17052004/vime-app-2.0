"use client";

import {
  ClipboardList,
  Clock,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from "lucide-react";

import PageGrid from "../ui/PageGrid";
import DashboardStatsCard from "../dashboard/DashboardStatsCard";

export default function SolicitacaoStats({
  solicitacoes,
}) {
  const cards = [
    {
      title: "Solicitadas",
      value: solicitacoes.filter(
        (s) => s.status === "SOLICITADA"
      ).length,
      subtitle: "Solicitações abertas",
      icon: ClipboardList,
    },

    {
      title: "Em Cotação",
      value: solicitacoes.filter(
        (s) => s.status === "EM COTAÇÃO"
      ).length,
      subtitle: "Aguardando orçamento",
      icon: Clock,
    },

    {
      title: "Compra",
      value: solicitacoes.filter(
        (s) =>
          s.status ===
          "AGUARDANDO COMPRA"
      ).length,
      subtitle: "Aguardando compra",
      icon: ShoppingCart,
    },

    {
      title: "Atendidas",
      value: solicitacoes.filter(
        (s) => s.status === "ATENDIDA"
      ).length,
      subtitle: "Solicitações concluídas",
      icon: CheckCircle,
    },

    {
      title: "Rejeitadas",
      value: solicitacoes.filter(
        (s) => s.status === "REJEITADA"
      ).length,
      subtitle: "Solicitações recusadas",
      icon: XCircle,
    },
  ];

  return (
    <PageGrid cols={5}>
      {cards.map((card) => (
        <DashboardStatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
        />
      ))}
    </PageGrid>
  );
}