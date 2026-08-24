"use client";

import { useState } from "react";

import {
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import ActionMenu from "../ui/ActionMenu";

export default function UnitActionsMenu({
  unidade,
  onView,
  onEdit,
  onDelete,
}) {

  const [open, setOpen] = useState(false);

  const [position, setPosition] =
    useState({ top: 0, left: 0 });

  function abrirMenu(e) {

    const rect = e.currentTarget.getBoundingClientRect();

    const largura = 208;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    if (left < 16) left = 16;

    setPosition({ top, left });
    setOpen(true);

  }

  function close() {
    setOpen(false);
  }

  return (

    <div className="relative">

      <button

        onClick={(e) => {

          e.stopPropagation();

          if (open) {
            close();
            return;
          }

          abrirMenu(e);

        }}

        className="

          flex
          items-center
          justify-center

          w-10
          h-10

          rounded-xl

          bg-[var(--surface-2)]

          border
          border-[var(--border-token)]

          hover:border-emerald-500/30

          hover:bg-emerald-500/10

          transition-all

        "

      >

        <EllipsisVertical
          size={18}
          className="text-[var(--text-muted)]"
        />

      </button>

      <ActionMenu
        open={open}
        position={position}
        onClose={close}
      >

        <MenuButton

          icon={<Eye size={17} />}

          label="Visualizar"

          onClick={() => {

            onView(unidade);

            close();

          }}

        />

        <MenuButton

          icon={<Pencil size={17} />}

          label="Editar"

          onClick={() => {

            onEdit(unidade);

            close();

          }}

        />

        <MenuButton

          danger

          icon={<Trash2 size={17} />}

          label="Excluir"

          onClick={() => {

            onDelete(unidade.id);

            close();

          }}

        />

      </ActionMenu>

    </div>

  );

}

function MenuButton({

  icon,

  label,

  danger,

  onClick,

}) {

  return (

    <button

      onClick={onClick}

      className={`

        w-full

        flex
        items-center

        gap-3

        px-4
        py-3

        text-sm

        transition

        ${
          danger
            ? `
              text-red-400

              hover:bg-red-500/10
            `
            : `
              text-[var(--text-1)]

              hover:bg-emerald-500/10
            `
        }

      `}

    >

      {icon}

      {label}

    </button>

  );

}
