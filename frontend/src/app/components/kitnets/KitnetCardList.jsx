"use client";

import { House } from "lucide-react";

import FadeIn from "../ui/FadeIn";
import EmptyState from "../ui/EmptyState";

import KitnetCard from "./KitnetCard";

export default function KitnetCardList({
  kitnets,
  onEdit,
  onDelete,
}) {

  if (!kitnets.length) {

    return (

      <FadeIn>

        <EmptyState
          icon={<House size={54} />}
          title="Nenhuma kitnet encontrada"
          description="Cadastre sua primeira kitnet para começar o gerenciamento."
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

        {kitnets.map((kitnet, index) => (

          <FadeIn
            key={kitnet.id}
            delay={index * 0.04}
          >

            <KitnetCard
              kitnet={kitnet}
              onEdit={onEdit}
              onDelete={onDelete}
            />

          </FadeIn>

        ))}

      </section>

    </FadeIn>

  );

}