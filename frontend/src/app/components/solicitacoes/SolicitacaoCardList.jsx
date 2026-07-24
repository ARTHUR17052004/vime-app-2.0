"use client";

import SolicitacaoCard from "./SolicitacaoCard";

export default function SolicitacaoCardList(props) {
  return (
    <div className="space-y-6">

      <SolicitacaoCard
        {...props}
      />

    </div>
  );
}