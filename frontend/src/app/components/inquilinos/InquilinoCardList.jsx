"use client";

import { Users } from "lucide-react";

import FadeIn from "../ui/FadeIn";
import EmptyState from "../ui/EmptyState";
import PageGrid from "../ui/PageGrid";

import InquilinoCard from "./InquilinoCard";

export default function InquilinoCardList({
  inquilinos,
  onEdit,
  onDelete,
}) {

  if (!inquilinos.length) {

    return (

      <FadeIn>

        <EmptyState
          icon={<Users size={54} />}
          title="Nenhum inquilino encontrado"
          description="Cadastre seu primeiro inquilino para começar o gerenciamento."
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

        {inquilinos.map((inquilino,index)=>(

          <FadeIn
            key={inquilino.id}
            delay={index*0.04}
          >

            <InquilinoCard
              inquilino={inquilino}
              onEdit={onEdit}
              onDelete={onDelete}
            />

          </FadeIn>

        ))}

      </PageGrid>

    </FadeIn>

  );

}