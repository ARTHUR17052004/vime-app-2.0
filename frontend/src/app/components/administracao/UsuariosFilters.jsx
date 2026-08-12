"use client";

import SearchInput from "../ui/SearchInput";

export default function UsuariosFilters({

  busca,

  setBusca,

}) {

  return (

    <SearchInput

      placeholder="Pesquisar usuário..."

      value={busca}

      onChange={(e)=>

        setBusca(e.target.value)

      }

    />

  );

}