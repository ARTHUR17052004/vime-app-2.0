"use client";

import { useState } from "react";
import Link from "next/link";

import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

export default function ContratoTable({
  contratos = [],
  onEdit,
  onDelete,
}) {

  const [menuAberto, setMenuAberto] =
    useState(null);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  function abrirMenu(e, id) {

  const rect = e.currentTarget.getBoundingClientRect();

  const larguraMenu = 220;

  let left = rect.right - larguraMenu;
  let top = rect.bottom + 8;

  // evita sair da tela pela direita
  if (left + larguraMenu > window.innerWidth - 16) {
    left = window.innerWidth - larguraMenu - 16;
  }

  // evita ficar muito colado na esquerda
  if (left < 16) {
    left = 16;
  }

  setMenuPosition({
    top,
    left,
  });

  setMenuAberto(id);

}

  if (!contratos.length) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-white/10

          bg-slate-900/80

          backdrop-blur-xl

          shadow-xl

          p-14

          text-center
        "
      >

        <h2 className="text-2xl font-bold text-white">

          Nenhum contrato cadastrado

        </h2>

        <p className="mt-3 text-gray-400">

          Cadastre o primeiro contrato para começar.

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
              transition-all
            "
          >

            <td className="px-6 py-5 font-semibold">

              {contrato.inquilino?.nome ||
                contrato.inquilinoNome ||
                "-"}

            </td>

            <td className="px-6 py-5">

              {contrato.unidade?.nome ||
                contrato.unidadeNome ||
                "-"}

            </td>

            <td className="px-6 py-5">

              {contrato.kitnet?.nome ||
                contrato.kitnetNome ||
                "-"}

            </td>

            <td className="px-6 py-5">

              R$ {Number(
                contrato.valorAluguel || 0
              ).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                }
              )}

            </td>

            <td className="px-6 py-5">

              Dia {contrato.diaVencimento}

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

            <td className="px-6 py-5 text-center">

              <button
                onClick={(e) => {

                  if (
                    menuAberto === contrato.id
                  ) {

                    setMenuAberto(null);

                    return;

                  }

                  abrirMenu(
                    e,
                    contrato.id
                  );

                }}
                className="
                  flex
                  items-center
                  justify-center

                  w-10
                  h-10

                  mx-auto

                  rounded-xl

                  bg-white/5

                  hover:bg-white/10

                  transition-all
                "
              >

                <MoreVertical
                  size={18}
                  className="text-gray-300"
                />

              </button>

              <ActionMenu
                open={
                  menuAberto === contrato.id
                }
                position={menuPosition}
                onClose={() =>
                  setMenuAberto(null)
                }
              >
                                <Link
                  href={`/contratos/${contrato.id}`}
                  className="
                    flex
                    items-center
                    gap-3

                    px-5
                    py-3

                    text-gray-300

                    hover:bg-white/5
                    transition
                  "
                >

                  <Eye size={18} />

                  Visualizar

                </Link>

                <button
                  onClick={() => {

                    setMenuAberto(null);

                    onEdit?.(contrato);

                  }}
                  className="
                    flex
                    items-center
                    gap-3

                    w-full

                    px-5
                    py-3

                    text-yellow-400

                    hover:bg-yellow-500/10
                    transition
                  "
                >

                  <Pencil size={18} />

                  Editar

                </button>

                <button
                  onClick={() => {

                    setMenuAberto(null);

                    onDelete?.(contrato.id);

                  }}
                  className="
                    flex
                    items-center
                    gap-3

                    w-full

                    px-5
                    py-3

                    text-red-400

                    hover:bg-red-500/10
                    transition
                  "
                >

                  <Trash2 size={18} />

                  Excluir

                </button>

              </ActionMenu>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </Table>

);
}