"use client";

import PageGrid from "../ui/PageGrid";

import AdministracaoCard from "./AdministracaoCard";

export default function AdministracaoStats({

  cards = [],

}) {

  return (

    <PageGrid cols={3}>

      {cards.map((card) => (

        <AdministracaoCard

          key={card.title}

          title={card.title}

          subtitle={card.subtitle}

          value={card.value}

          icon={card.icon}

          color={card.color}

        />

      ))}

    </PageGrid>

  );

}