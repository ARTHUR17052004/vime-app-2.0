"use client";

import { useState } from "react";
import Link from "next/link";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
export default function InquilinoTable({
  inquilinos,
  onDelete,
  onEdit,
}) {
  const [menuAberto, setMenuAberto] =
    useState(null);

  if (inquilinos.length === 0) {
    return (
      <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-xl
            p-12
            text-center
            text-gray-300
          "
        >
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
    <Table>
      <table className="w-full text-gray-800">
        <thead className="border-b border-white/10 text-gray-400 uppercase text-xs tracking-[0.25em]">
          <tr>
            <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-gray-400

                font-semibold
              "
            >
              Inquilino
            </th>

           <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-gray-400

                font-semibold
              "
            >
              Kitnet
            </th>

            <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-gray-400

                font-semibold
              "
            >
              Contato
            </th>

            <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-gray-400

                font-semibold
              "
            >
              Contrato
            </th>

            <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-gray-400

                font-semibold
              "
            >
              Status
            </th>

            <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-gray-400

                font-semibold
              "
            >
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {inquilinos.map((inquilino) => (
            <tr
              key={inquilino.id}
              className="
              border-b
              border-white/5
              hover:bg-white/5
              transition
              "
            >
              <td className="px-6 py-5">
                <div className="font-semibold">
                  {inquilino.nome}
                </div>

                <div className="text-sm text-gray-500">
                  CPF: {inquilino.cpf}
                </div>
              </td>

              <td className="px-6 py-5">
                {inquilino.unidadeNome
                  ? `${inquilino.unidadeNome} - ${inquilino.kitnetNome || ""}`
                  : inquilino.kitnetNome || "-"}
              </td>

              <td className="px-6 py-5">
                <div>
                  {inquilino.email || "-"}
                </div>

                <div className="text-sm text-gray-500">
                  {inquilino.telefone || "-"}
                </div>
              </td>

              <td className="px-6 py-5">
                {inquilino.dataFimContrato
                  ? new Date(inquilino.dataFimContrato).toLocaleDateString("pt-BR")
                  : "-"}
              </td>

              <td className="px-6 py-5">
               <Badge
                color={
                  inquilino.ativo
                    ? "green"
                    : "red"
                }
              >
                {inquilino.ativo
                  ? "Ativo"
                  : "Inativo"}
              </Badge>
              </td>

              <td className="px-6 py-5 text-center relative">
                <button
                  onClick={() =>
                    setMenuAberto(
                      menuAberto === inquilino.id
                        ? null
                        : inquilino.id
                    )
                  }
                  className="
                    w-10
                    h-10

                    rounded-xl

                    bg-white/5

                    hover:bg-white/10

                    transition

                    flex
                    items-center
                    justify-center

                    text-white
                    text-xl
                  "
                >
                  ⋮
                </button>

                {menuAberto ===
                  inquilino.id && (
                  <div
                    className="
                    absolute

                    right-2
                    top-12

                    w-44

                    rounded-2xl

                    border
                    border-white/10

                    bg-slate-900/95

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
                        hover:bg-white/5
                        text-gray-300
                        transition
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
                        hover:bg-yellow-500/10
                        text-yellow-400
                        transition
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
                        hover:bg-red-500/10
                        text-red-400
                        transition
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
    </Table>
  );
}