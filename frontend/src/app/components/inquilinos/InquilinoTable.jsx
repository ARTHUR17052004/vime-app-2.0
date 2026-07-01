"use client";

import { useState } from "react";
import Link from "next/link";

export default function InquilinoTable({
  inquilinos,
  onDelete,
  onEdit,
}) {
  const [menuAberto, setMenuAberto] =
    useState(null);

  if (inquilinos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Módulo Inquilinos
        </h2>

        <p className="text-gray-500">
          Nenhum inquilino cadastrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-visible">
      <table className="w-full text-gray-800">
        <thead className="bg-gray-50 border-b text-gray-700">
          <tr>
            <th className="text-left p-4">
              Inquilino
            </th>

            <th className="text-left p-4">
              Kitnet
            </th>

            <th className="text-left p-4">
              Contato
            </th>

            <th className="text-left p-4">
              Contrato
            </th>

            <th className="text-left p-4">
              Status
            </th>

            <th className="text-center p-4">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {inquilinos.map((inquilino) => (
            <tr
              key={inquilino.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-4">
                <div className="font-semibold">
                  {inquilino.nome}
                </div>

                <div className="text-sm text-gray-500">
                  CPF: {inquilino.cpf}
                </div>
              </td>

              <td className="p-4">
                {inquilino.unidadeNome
                  ? `${inquilino.unidadeNome} - ${inquilino.kitnetNome}`
                  : inquilino.kitnetNome || "-"}
              </td>

              <td className="p-4">
                <div>
                  {inquilino.email}
                </div>

                <div className="text-sm text-gray-500">
                  {inquilino.telefone}
                </div>
              </td>

              <td className="p-4">
                {inquilino.dataFimContrato ||
                  "-"}
              </td>

              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    inquilino.ativo
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {inquilino.ativo
                    ? "Ativo"
                    : "Inativo"}
                </span>
              </td>

              <td className="p-4 text-center relative">
                <button
                  onClick={() =>
                    setMenuAberto(
                      menuAberto ===
                        inquilino.id
                        ? null
                        : inquilino.id
                    )
                  }
                  className="
                    text-2xl
                    font-bold
                    text-gray-600
                  "
                >
                  ⋮
                </button>

                {menuAberto ===
                  inquilino.id && (
                  <div
                    className="
                      absolute
                      right-4
                      top-12
                      bg-white
                      border
                      rounded-xl
                      shadow-lg
                      z-50
                      w-40
                    "
                  >
                    <Link
                      href={`/inquilinos/${inquilino.id}`}
                      className="
                        block
                        px-4
                        py-3
                        hover:bg-gray-100
                      "
                    >
                      Visualizar
                    </Link>

                    <button
                      onClick={() => {
                        onEdit?.(
                          inquilino
                        );

                        setMenuAberto(
                          null
                        );
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        hover:bg-yellow-50
                        text-yellow-700
                      "
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        onDelete?.(
                          inquilino.id
                        );

                        setMenuAberto(
                          null
                        );
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        hover:bg-red-50
                        text-red-700
                      "
                    >
                      Excluir
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