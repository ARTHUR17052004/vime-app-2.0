"use client";

import { Building2 } from "lucide-react";

import FadeIn from "../ui/FadeIn";
import EmptyState from "../ui/EmptyState";

import LocadorCard from "./LocadorCard";

export default function LocadorCardList({
  locadores,
  onView,
  onEdit,
  onDelete,
}) {

  if (!locadores.length) {

    return (

      <FadeIn>

        <EmptyState
          icon={<Building2 size={54} />}
          title="Nenhum locador encontrado"
          description="Cadastre seu primeiro locador para começar o gerenciamento."
        />

      </FadeIn>

    );

  }

  return (

    <FadeIn>

      <LocadorCard
        locadores={locadores}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />

    </FadeIn>

  );

}