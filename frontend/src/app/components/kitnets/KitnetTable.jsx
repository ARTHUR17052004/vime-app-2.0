"use client";

import { useState } from "react";
import Link from "next/link";

export default function KitnetTable({
  kitnets,
  onEdit,
  onDelete,
}) {
  const [menuAberto, setMenuAberto] =
    useState(null);

  if (kitnets.length === 0) {
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
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-gray-800">
        <thead className="bg-gray-50 border-b text-gray-700">
          <tr>
            <th className="text-left p-4">Kitnet</th>
            <th className="text-left p-4">Unidade</th>
            <th className="text-left p-4">Número</th>
            <th className="text-left p-4">Metragem</th>
            <th className="text-left p-4">Aluguel</th>
            <th className="text-left p-4">Status</th>
            <th className="text-center p-4">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {kitnets.map((kitnet) => (
            <tr
              key={kitnet.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-4 font-medium">
                {kitnet.nome}
              </td>

              <td className="p-4">
                {kitnet.unidadeNome}
              </td>

              <td className="p-4">
                {kitnet.numero}
              </td>

              <td className="p-4">
                {kitnet.metragem} m²
              </td>

              <td className="p-4">
                R$ {kitnet.aluguel}
              </td>

              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    kitnet.status === "Disponível"
                      ? "bg-green-100 text-green-700"
                      : kitnet.status === "Ocupada"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {kitnet.status}
                </span>
              </td>

              <td className="p-4 text-center relative">
                <button
                  onClick={() =>
                    setMenuAberto(
                      menuAberto === kitnet.id
                        ? null
                        : kitnet.id
                    )
                  }
                  className="
                    text-2xl
                    font-bold
                    text-gray-600
                    hover:text-gray-900
                  "
                >
                  ⋮
                </button>

                {menuAberto === kitnet.id && (
                  <div
                    className="
                      absolute
                      right-4
                      mt-2
                      w-40
                      bg-white
                      border
                      rounded-xl
                      shadow-lg
                      z-50
                    "
                  >
                    <Link
                      href={`/kitnets/${kitnet.id}`}
                      className="
                        block
                        px-4
                        py-3
                        text-left
                        hover:bg-gray-100
                      "
                    >
                      👁 Visualizar
                    </Link>

                    <button
                      onClick={() => {
                        onEdit(kitnet);
                        setMenuAberto(null);
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        hover:bg-gray-100
                      "
                    >
                      ✏️ Editar
                    </button>

                    <button
                      onClick={() => {
                        onDelete(kitnet.id);
                        setMenuAberto(null);
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        text-red-600
                        hover:bg-red-50
                      "
                    >
                      🗑 Excluir
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}