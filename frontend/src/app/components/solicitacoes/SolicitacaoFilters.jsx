"use client";

import Filters from "../ui/Filters";

export default function SolicitacaoFilters({
  filtroStatus,
  setFiltroStatus,
}) {
  return (
    <Filters
      value={filtroStatus}
      onChange={setFiltroStatus}
      options={[
        "Todos",
        "SOLICITADA",
        "EM COTAÇÃO",
        "AGUARDANDO COMPRA",
        "ATENDIDA",
        "REJEITADA",
      ]}
    />
  );
}