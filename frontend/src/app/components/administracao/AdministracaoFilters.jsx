"use client";

import SearchInput from "../ui/SearchInput";
import Select from "../ui/Select";

export default function AdministracaoFilters({

  busca,

  onBuscaChange,

  perfil,

  onPerfilChange,

  status,

  onStatusChange,

}) {

  return (

    <div
      className="
        grid
        gap-6

        lg:grid-cols-3
      "
    >

      <SearchInput

        placeholder="Pesquisar usuário..."

        value={busca}

        onChange={onBuscaChange}

      />

      <Select

        value={perfil}

        onChange={onPerfilChange}

        options={[

          {
            label: "Todos os Perfis",
            value: "",
          },

          {
            label: "Administrador",
            value: "ADMINISTRADOR",
          },

          {
            label: "Administrativo",
            value: "ADMINISTRATIVO",
          },

          {
            label: "Zelador",
            value: "ZELADOR",
          },

        ]}

      />

      <Select

        value={status}

        onChange={onStatusChange}

        options={[

          {
            label: "Todos os Status",
            value: "",
          },

          {
            label: "Ativo",
            value: "ATIVO",
          },

          {
            label: "Inativo",
            value: "INATIVO",
          },

        ]}

      />

    </div>

  );

}