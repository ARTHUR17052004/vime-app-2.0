"use client";

import SearchInput from "../ui/SearchInput";

export default function AdministracaoSearch({

  value,

  onChange,

}) {

  return (

    <SearchInput

      placeholder="Pesquisar usuário..."

      value={value}

      onChange={onChange}

    />

  );

}