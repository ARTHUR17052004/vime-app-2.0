"use client";

import { useState } from "react";

import {
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import ActionMenu from "../ui/ActionMenu";
import { usePermissao } from "../../../hooks/usePermissao";

export default function KitnetActionsMenu({
  kitnet,
  onEdit,
  onDelete,
}) {

  const router = useRouter();

  const podeEditar = usePermissao("kitnets.editar");
  const podeExcluir = usePermissao("kitnets.excluir");

  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  function abrirMenu(e) {

    e.stopPropagation();

    const rect =
      e.currentTarget.getBoundingClientRect();

    const larguraMenu = 220;

    let left =
      rect.right - larguraMenu;

    let top =
      rect.bottom + 8;

    if (
      left + larguraMenu >
      window.innerWidth - 16
    ) {
      left =
        window.innerWidth -
        larguraMenu -
        16;
    }

    if (left < 16) {
      left = 16;
    }

    setPosition({
      top,
      left,
    });

    setOpen(true);

  }

  return (

    <>

      <button
        onClick={(e) => {

          if (open) {

            setOpen(false);

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

          hover:bg-emerald-500/10
          hover:border-emerald-500/30

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
        onClose={() =>
          setOpen(false)
        }
      >

        <MenuButton
          icon={<Eye size={17} />}
          label="Visualizar"
          onClick={() => {

            router.push(
              `/kitnets/${kitnet.id}`
            );

            setOpen(false);

          }}
        />

        {podeEditar && (
          <MenuButton
            icon={<Pencil size={17} />}
            label="Editar"
            onClick={() => {

              onEdit?.(kitnet);

              setOpen(false);

            }}
          />
        )}

        {podeExcluir && (
          <MenuButton
            danger
            icon={<Trash2 size={17} />}
            label="Excluir"
            onClick={() => {

              onDelete?.(kitnet.id);

              setOpen(false);

            }}
          />
        )}

      </ActionMenu>

    </>

  );

}

function MenuButton({

  icon,

  label,

  danger = false,

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

        px-5
        py-3

        text-sm

        transition-all

        ${
          danger
            ? `
              text-red-400
              hover:bg-red-500/10
            `
            : `
              text-[var(--text-1)]
              hover:bg-[var(--surface-2)]
            `
        }
      `}
    >

      {icon}

      <span>

        {label}

      </span>

    </button>

  );

}