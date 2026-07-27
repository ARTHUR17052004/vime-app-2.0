"use client";

import SearchInput from "../common/SearchInput";

export default function RelatorioFilters({
  value,
  onChange,
}) {
  return (
    <SearchInput
      placeholder="Pesquisar relatório..."
      value={value}
      onChange={onChange}
    />
  );
}