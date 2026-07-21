"use client";

import { Building2 } from "lucide-react";

import FadeIn from "../ui/FadeIn";
import EmptyState from "../ui/EmptyState";

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

      <section
        className="
          grid

          grid-cols-1

          md:grid-cols-2

          2xl:grid-cols-3

          gap-8

          items-stretch
        "
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

      </section>

    </FadeIn>

  );

}