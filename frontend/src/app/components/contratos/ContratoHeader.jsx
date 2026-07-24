"use client";

import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";

export default function ContratoHeader({
  total,
  onNovo,
}) {
  return (
    <PageHeader
      title="Contratos"
      subtitle="Gerencie todos os contratos cadastrados."
      counter={`${total} contrato(s) cadastrado(s)`}
      actions={
        <PrimaryButton onClick={onNovo}>
          + Novo Contrato
        </PrimaryButton>
      }
    />
  );
}