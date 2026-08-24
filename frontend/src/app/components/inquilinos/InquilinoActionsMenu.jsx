"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

import ActionMenu from "../ui/ActionMenu";

export default function InquilinoActionsMenu({
  inquilino,
  onEdit,
  onDelete,
}) {

  const [open, setOpen] =
    useState(false);

  const [position, setPosition] =
    useState({ top: 0, left: 0 });

  function abrirMenu(e) {

    const rect = e.currentTarget.getBoundingClientRect();

    const largura = 176;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    if (left < 16) left = 16;

    setPosition({ top, left });
    setOpen(true);

  }

  return (

    <div className="relative">

      <button
        onClick={(e) => {
          e.stopPropagation();

          if (open) {
            setOpen(false);
            return;
          }

          abrirMenu(e);
        }}
        className="
          w-10
          h-10

          rounded-xl

          flex
          items-center
          justify-center

          hover:bg-[var(--surface-2)]
          transition
        "
      >

        <MoreVertical
          size={18}
          className="text-[var(--text-subtle)]"
        />

      </button>

      <ActionMenu
        open={open}
        position={position}
        onClose={() => setOpen(false)}
      >

        <Link
          href={`/inquilinos/${inquilino.id}`}
          className="
            block
            px-4
            py-3

            text-[var(--text-muted)]

            hover:bg-[var(--surface-2)]

            transition
          "
        >
          Visualizar
        </Link>

        <button
          onClick={() => {
            onEdit?.(inquilino);
            setOpen(false);
          }}
          className="
            w-full
            text-left

            px-4
            py-3

            text-yellow-400

            hover:bg-yellow-500/10

            transition
          "
        >
          Editar
        </button>

        <button
          onClick={() => {
            onDelete?.(inquilino.id);
            setOpen(false);
          }}
          className="
            w-full
            text-left

            px-4
            py-3

            text-red-400

            hover:bg-red-500/10

            transition
          "
        >
          Excluir
        </button>

      </ActionMenu>

    </div>

  );

}
