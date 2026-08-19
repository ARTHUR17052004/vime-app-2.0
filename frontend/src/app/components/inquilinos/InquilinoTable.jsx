"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

export default function InquilinoTable({
  inquilinos,
  onDelete,
  onEdit,
}) {

  const router = useRouter();

  const [menuAberto, setMenuAberto] =
    useState(null);

  const [posicaoMenu, setPosicaoMenu] =
    useState({ top: 0, left: 0 });

  function abrirMenu(e, id) {

    const rect = e.currentTarget.getBoundingClientRect();

    const larguraMenu = 176;

    let left = rect.right - larguraMenu;
    let top = rect.bottom + 8;

    if (left + larguraMenu > window.innerWidth - 16) {
      left = window.innerWidth - larguraMenu - 16;
    }

    if (left < 16) left = 16;

    setPosicaoMenu({ top, left });

    setMenuAberto(id);

  }

  if (inquilinos.length === 0) {
    return (
      <div
          className="
            rounded-3xl
            border
            border-[var(--border-token)]
            bg-[var(--surface)]
            backdrop-blur-xl
            p-12
            text-center
          "
        >
        <h2 className="text-2xl font-semibold text-[var(--text)] mb-3">
          Módulo Inquilinos
        </h2>

        <p className="text-[var(--text-subtle)]">
          Nenhum inquilino cadastrado ainda.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <table className="w-full text-[var(--text-1)]">
        <thead className="border-b border-[var(--border-token)] text-[var(--text-subtle)] uppercase text-xs tracking-[0.25em]">
          <tr>
            <th
              className="
                px-6
                py-5

                text-xs

                uppercase

                tracking-[0.22em]

                text-[var(--text-subtle)]

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

                text-[var(--text-subtle)]

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

                text-[var(--text-subtle)]

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

                text-[var(--text-subtle)]

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

                text-[var(--text-subtle)]

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

                text-[var(--text-subtle)]

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
              border-[var(--border-token)]
              hover:bg-[var(--surface-2)]
              transition
              "
            >
              <td className="px-6 py-5">
                <div className="font-semibold">
                  {inquilino.nome}
                </div>

                <div className="text-sm text-[var(--text-faint)]">
                  CPF: {inquilino.cpf}
                </div>
              </td>

              <td className="px-6 py-5">
                {(() => {
                  const nomeUnidade =
                    inquilino.kitnet?.unidade?.nome || inquilino.unidadeNome;
                  const nomeKitnet =
                    inquilino.kitnet?.nome ||
                    inquilino.kitnet?.numero ||
                    inquilino.kitnetNome;

                  if (nomeUnidade && nomeKitnet) return `${nomeUnidade} - ${nomeKitnet}`;
                  return nomeKitnet || nomeUnidade || "-";
                })()}
              </td>

              <td className="px-6 py-5">
                <div>
                  {inquilino.email || "-"}
                </div>

                <div className="text-sm text-[var(--text-faint)]">
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

              <td className="px-6 py-5 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (menuAberto === inquilino.id) {
                      setMenuAberto(null);
                      return;
                    }

                    abrirMenu(e, inquilino.id);
                  }}
                  className="
                    w-10
                    h-10

                    rounded-xl

                    bg-[var(--surface-2)]

                    hover:bg-[var(--surface-3)]

                    transition

                    flex
                    items-center
                    justify-center

                    text-[var(--text)]
                    text-xl
                  "
                >
                  ⋮
                </button>

                <ActionMenu
                  open={menuAberto === inquilino.id}
                  position={posicaoMenu}
                  onClose={() => setMenuAberto(null)}
                >

                  <button
                    onClick={() => {
                      setMenuAberto(null);
                      router.push(`/inquilinos/${inquilino.id}`);
                    }}
                    className="
                      w-full
                      text-left
                      px-4
                      py-3
                      hover:bg-[var(--surface-2)]
                      text-[var(--text-muted)]
                      transition
                    "
                  >
                    Visualizar
                  </button>

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

                </ActionMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Table>
  );
}