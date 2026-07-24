"use client";

import SearchInput from "../common/SearchInput";

export default function InquilinoFilters({
  value,
  onChange,
}) {
  return (
    <SearchInput
      placeholder="Pesquisar inquilino..."
      value={value}
      onChange={onChange}
    />
  );
}