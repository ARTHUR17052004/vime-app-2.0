"use client";

import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import StatCounter from "../common/StatCounter";

export default function RelatorioHeader({
  total,
}) {
  return (
    <PageHeader
      title="Relatórios"
      subtitle="Central de relatórios do VIME 2.0."
    >
      <StatCounter>
        {total} módulos
      </StatCounter>

      <PrimaryButton>
        Exportar
      </PrimaryButton>
    </PageHeader>
  );
}