"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

export default function InquilinoActionsMenu({
  inquilino,
  onEdit,
  onDelete,
}) {

  const [open, setOpen] =
    useState(false);

  return (

    <div className="relative">

      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
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

      {open && (

        <div
          className="
            absolute
            right-0
            top-12

            w-44

            rounded-2xl

            border
            border-[var(--border-token)]

            bg-[var(--surface)]

            backdrop-blur-xl

            shadow-2xl

            overflow-hidden

            z-50
          "
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

        </div>

      )}

    </div>

  );

}