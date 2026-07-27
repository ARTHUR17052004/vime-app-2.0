"use client";

import { useState } from "react";
import Link from "next/link";

import Table from "../ui/Table";
import Badge from "../ui/Badge";

export default function ContratoTable({
  contratos = [],
  onEdit,
  onDelete,
}) {
  const [menuAberto, setMenuAberto] = useState(null);

  if (contratos.length === 0) {
    return (
      <div
        className="
          rounded-[22px]
          border
          border-white/5
          bg-linear-to-br
          from-[#1b2728]/80
          via-[#1a242c]/75
          to-[#151d26]/80
          backdrop-blur-xl
          p-14
          text-center
        "
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Nenhum contrato cadastrado
        </h2>

        <p className="text-gray-400">
          Cadastre um contrato para começar.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <table className="w-full text-gray-200">

        <thead className="border-b border-white/10">

          <tr>

            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-gray-400">
              Inquilino
            </th>

            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-gray-400">
              Unidade
            </th>

            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-gray-400">
              Kitnet
            </th>

            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-gray-400">
              Aluguel
            </th>

            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-gray-400">
              Vencimento
            </th>

            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-gray-400">
              Status
            </th>

            <th className="px-6 py-5 text-center uppercase text-xs tracking-[0.22em] text-gray-400">
              Ações
            </th>

          </tr>

        </thead>

        <tbody>

          {contratos.map((contrato) => (

            <tr
              key={contrato.id}
              className="
                border-b
                border-white/5
                hover:bg-white/5
                transition
              "
            >

              <td className="px-6 py-5">

                <div className="font-semibold">
                  {contrato.inquilinoNome || "-"}
                </div>

              </td>

              <td className="px-6 py-5">
                {contrato.unidadeNome || "-"}
              </td>

              <td className="px-6 py-5">
                {contrato.kitnetNome || "-"}
              </td>

              <td className="px-6 py-5">
                R$ {contrato.valorAluguel || "0,00"}
              </td>

              <td className="px-6 py-5">
                Dia {contrato.diaVencimento || "-"}
              </td>

              <td className="px-6 py-5">

              <Badge
                variant={
                  contrato.status === "ATIVO"
                    ? "emerald"
                    : contrato.status === "PENDENTE"
                    ? "yellow"
                    : contrato.status === "ENCERRADO"
                    ? "gray"
                    : "red"
                }
              >
                {contrato.status}
              </Badge>

              </td>

              <td className="px-6 py-5 text-center relative">

                <button
                  onClick={() =>
                    setMenuAberto(
                      menuAberto === contrato.id
                        ? null
                        : contrato.id
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white/5
                    hover:bg-white/10
                    transition
                  "
                >
                  ⋮
                </button>

                {menuAberto === contrato.id && (

                  <div
                    className="
                      absolute
                      right-2
                      top-12
                      w-44
                      rounded-2xl
                      border
                      border-white/10
                      bg-slate-900
                      shadow-2xl
                      overflow-hidden
                      z-50
                    "
                  >

                    <Link
                      href={`/contratos/${contrato.id}`}
                      className="
                        block
                        px-4
                        py-3
                        hover:bg-white/5
                      "
                    >
                      Visualizar
                    </Link>

                    <button
                      onClick={() => {
                        onEdit?.(contrato);
                        setMenuAberto(null);
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        text-yellow-400
                        hover:bg-yellow-500/10
                      "
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        onDelete?.(contrato.id);
                        setMenuAberto(null);
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        text-red-400
                        hover:bg-red-500/10
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