"use client";

import SearchInput from "../common/SearchInput";

export default function FinanceiroFilters({
  value,
  onChange,
}) {
  return (
    <SearchInput
      placeholder="Pesquisar movimentação..."
      value={value}
      onChange={onChange}
    />
  );
}