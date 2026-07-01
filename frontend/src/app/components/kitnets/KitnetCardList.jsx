"use client";

import KitnetCard from "./KitnetCard";

export default function KitnetCardList({
  kitnets,
}) {
  if (!kitnets.length) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Módulo Kitnets
        </h2>

        <p className="text-gray-500">
          Nenhuma kitnet cadastrada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kitnets.map((kitnet) => (
        <KitnetCard
          key={kitnet.id}
          kitnet={kitnet}
        />
      ))}
    </div>
  );
}