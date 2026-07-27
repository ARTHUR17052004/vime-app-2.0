"use client";

import { useEffect, useRef, useState } from "react";

import {
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function UnitActionsMenu({
  unidade,
  onView,
  onEdit,
  onDelete,
}) {

  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  useEffect(() => {

    function handleClick(e) {

      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {

        setOpen(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );

  }, []);

  function close() {
    setOpen(false);
  }

  return (

    <div
      ref={ref}
      className="relative"
    >

      <button

        onClick={(e) => {

          e.stopPropagation();

          setOpen(!open);

        }}

        className="

          flex
          items-center
          justify-center

          w-10
          h-10

          rounded-xl

          bg-white/5

          border
          border-white/10

          hover:border-emerald-500/30

          hover:bg-emerald-500/10

          transition-all

        "

      >

        <EllipsisVertical
          size={18}
          className="text-gray-300"
        />

      </button>

      {open && (

        <div

          className="

            absolute

            right-0
            top-12

            w-52

            rounded-2xl

            border
            border-white/10

            bg-[#19242b]/95

            backdrop-blur-xl

            shadow-2xl

            overflow-hidden

            z-50

          "

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

        </div>

      )}

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
              text-gray-200

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