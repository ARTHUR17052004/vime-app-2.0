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
            border-white/[0.07]
            bg-gradient-to-br
            from-[#202a36]/95
            via-[#1b2430]/96
            to-[#151c25]/96
            backdrop-blur-xl
            p-12
            text-center
          "
        >
        <h2 className="text-2xl font-semibold text-white mb-3">
          Módulo Inquilinos
        </h2>

        <p className="text-gray-400">
          Nenhum inquilino cadastrado ainda.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <table className="w-full text-gray-200">
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
                      hover:bg-white/5
                      text-gray-300
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