"use client";

import { useState } from "react";

export default function UnitActionsMenu({
  unidade,
  onView,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xl text-gray-500 hover:text-gray-800"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-50">
          <button
            onClick={() => {
              onView(unidade);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-3 hover:bg-gray-100"
          >
            👁 Visualizar
          </button>

          <button
            onClick={() => {
              onEdit(unidade);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-3 hover:bg-gray-100"
          >
            ✏️ Editar
          </button>

          <button
            onClick={() => {
              onDelete(unidade.id);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
          >
            🗑 Excluir
          </button>
        </div>
      )}
    </div>
  );
}