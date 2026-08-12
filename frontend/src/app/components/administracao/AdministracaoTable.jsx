"use client";

import Table from "../ui/Table";

export default function AdministracaoTable({

  columns,

  data,

  loading = false,

  emptyMessage = "Nenhum registro encontrado.",

  onRowClick,

}) {

  return (

    <Table

      columns={columns}

      data={data}

      loading={loading}

      emptyMessage={emptyMessage}

      onRowClick={onRowClick}

    />

  );

}