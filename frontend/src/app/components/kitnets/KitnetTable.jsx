"use client";

import { useRouter } from "next/navigation";

import Table from "../ui/Table";
import EmptyState from "../ui/EmptyState";

import KitnetActionsMenu from "./KitnetActionsMenu";

import { House } from "lucide-react";

export default function KitnetTable({
  kitnets,
  onEdit,
  onDelete,
}) {

  const router = useRouter();

  if (!kitnets.length) {

    return (

      <EmptyState
        icon={<House size={54} />}
        title="Nenhuma kitnet cadastrada"
        description="Cadastre sua primeira kitnet para começar o gerenciamento."
      />

    );

  }

  const columns = [

    {
      key: "nome",
      title: "Kitnet",
    },

    {
      key: "unidadeNome",
      title: "Unidade",
      render: (item) =>
        item.unidade?.nome || item.unidadeNome || "-",
    },

    {
      key: "numero",
      title: "Número",
    },

    {
      key: "metragem",
      title: "Metragem",
      render: (item) => `${item.metragem} m²`,
    },

    {
      key: "aluguel",
      title: "Aluguel",
      render: (item) => `R$ ${item.aluguel}`,
    },

    {
      key: "status",
      title: "Status",
      render: (item) => {

        const statusLabel = {
          DISPONIVEL: "Disponível",
          OCUPADA: "Ocupada",
          MANUTENCAO: "Manutenção",
        }[item.status] || item.status;

        return (

          <span
            className={`
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold

              ${
                item.status === "DISPONIVEL"

                  ? "bg-emerald-500/15 text-emerald-400"

                  : item.status === "OCUPADA"

                  ? "bg-sky-500/15 text-sky-400"

                  : "bg-yellow-500/15 text-yellow-400"

              }
            `}
          >

            {statusLabel}

          </span>

        );

      },
    },

    {
      key: "acoes",
      title: "",
      render: (item) => (

        <KitnetActionsMenu
          kitnet={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      ),
    },

  ];

  return (

    <Table
      columns={columns}
      data={kitnets}
      onRowClick={(item) => {
        router.push(`/kitnets/${item.id}`);
      }}
    />

  );

}