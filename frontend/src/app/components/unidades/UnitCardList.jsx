"use client";

import { Building2 } from "lucide-react";

import FadeIn from "../ui/FadeIn";
import EmptyState from "../ui/EmptyState";
import PageGrid from "../ui/PageGrid";

import UnitCard from "./UnitCard";

export default function UnitCardList({
  unidades,
  onView,
  onEdit,
  onDelete,
}) {

  if (!unidades.length) {

    return (

      <FadeIn>

        <EmptyState
          icon={<Building2 size={54} />}
          title="Nenhuma unidade encontrada"
          description="Cadastre sua primeira unidade para começar o gerenciamento."
        />

      </FadeIn>

    );

  }

  return (

    <FadeIn>

      <PageGrid
        cols={3}
        gap="relaxed"
      >

        {unidades.map((unidade, index) => (

          <FadeIn
            key={unidade.id}
            delay={index * 0.04}
          >

            <UnitCard
              unidade={unidade}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />

          </FadeIn>

        ))}

      </PageGrid>

    </FadeIn>

  );

}