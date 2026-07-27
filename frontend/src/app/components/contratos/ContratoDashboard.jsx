"use client";

import ContratoResumo from "./ContratoResumo";

export default function ContratoDashboard({
  contratos,
}) {
  return (
    <ContratoResumo
      contratos={contratos}
    />
  );
}