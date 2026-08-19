"use client";

import { useState } from "react";
import Link from "next/link";

import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  PenLine,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

export default function ContratoTable({
  contratos = [],
  onEdit,
  onDelete,
  onBaixarPdf,
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
          border-[var(--border-token)]

          bg-[var(--surface)]

          backdrop-blur-xl

          shadow-xl

          p-14

          text-center
        "
      >

        <h2 className="text-2xl font-bold text-[var(--text)]">

          Nenhum contrato cadastrado

        </h2>

        <p className="mt-3 text-[var(--text-subtle)]">

          Cadastre o primeiro contrato para começar.

        </p>

      </div>

    );

  }

  return (

  <Table>

    <table className="w-full text-[var(--text-1)]">

      <thead className="border-b border-[var(--border-token)]">

        <tr>

          <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Inquilino
          </th>

          <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Residência
          </th>

          <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Kitnet
          </th>

          <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Aluguel
          </th>

          <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Vencimento
          </th>

          <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Status
          </th>

          <th className="px-6 py-5 text-center uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
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
              border-[var(--border-token)]
              hover:bg-[var(--surface-2)]
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

                  bg-[var(--surface-2)]

                  hover:bg-[var(--surface-3)]

                  transition-all
                "
              >

                <MoreVertical
                  size={18}
                  className="text-[var(--text-muted)]"
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

                    text-[var(--text-muted)]

                    hover:bg-[var(--surface-2)]
                    transition
                  "
                >

                  <Eye size={18} />

                  Visualizar

                </Link>

                <button
                  onClick={() => {

                    setMenuAberto(null);

                    onBaixarPdf?.(contrato.id);

                  }}
                  className="
                    flex
                    items-center
                    gap-3

                    w-full

                    px-5
                    py-3

                    text-emerald-400

                    hover:bg-emerald-500/10
                    transition
                  "
                >

                  <Download size={18} />

                  Baixar PDF

                </button>

                {contrato.clicksignSigningUrl && (

                  <a
                    href={contrato.clicksignSigningUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuAberto(null)}
                    className="
                      flex
                      items-center
                      gap-3

                      px-5
                      py-3

                      text-sky-400

                      hover:bg-sky-500/10
                      transition
                    "
                  >

                    <PenLine size={18} />

                    Assinar na Clicksign

                  </a>

                )}

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