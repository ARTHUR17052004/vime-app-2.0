"use client";

import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import StatCounter from "../common/StatCounter";

export default function VistoriaHeader({
  total,
  onNovo,
}) {
  return (
    <PageHeader
      title="Vistorias"
      subtitle="Gerencie todas as vistorias cadastradas."
    >
      <StatCounter>
        {total} vistoria(s)
      </StatCounter>

      <PrimaryButton
        onClick={onNovo}
      >
        + Nova Vistoria
      </PrimaryButton>
    </PageHeader>
  );
}