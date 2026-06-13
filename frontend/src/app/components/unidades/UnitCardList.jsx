"use client";

import UnitCard from "./UnitCard";

export default function UnitCardList({
  unidades,
  onView,
  onEdit,
  onDelete,
}) {
  if (unidades.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        Nenhuma unidade cadastrada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {unidades.map((unidade) => (
        <UnitCard
          key={unidade.id}
          unidade={unidade}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}