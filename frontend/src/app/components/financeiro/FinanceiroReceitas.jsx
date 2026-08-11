"use client";

import { useState } from "react";
import {
  MoreVertical,
  Wallet,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";

import ReceitaVisualizarModal from "./ReceitaVisualizarModal";
import ReceitaEditarModal from "./ReceitaEditarModal";

export default function FinanceiroReceitas({
  receitas,
  onDelete,
  onUpdate,
  onMarcarPago,
}) {
  const [menuAberto, setMenuAberto] =
    useState(null);

  const [receitaSelecionada, setReceitaSelecionada] =
    useState(null);

  const [visualizarOpen, setVisualizarOpen] =
    useState(false);

  const [editarOpen, setEditarOpen] =
    useState(false);

  const corStatus = (status) => {
    if (status === "Pago") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Atrasado") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
  <>
    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-emerald-500/10

              border
              border-emerald-500/20

              flex
              items-center
              justify-center
            "
          >

            <Wallet className="w-6 h-6 text-emerald-400" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Receitas
            </h2>

            <p className="text-gray-400">
              Controle das receitas cadastradas.
            </p>

          </div>

        </div>

      </div>

      {receitas.length === 0 ? (
        <div className="text-gray-400">
          Nenhuma receita cadastrada.
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">

          <table className="w-full text-gray-200">

            <thead
              className="
                border-b
                border-white/10

                text-gray-400

                uppercase

                tracking-[0.22em]

                text-xs
              "
            >
              <tr>
                <th className="text-left py-4">
                  Descrição
                </th>

                <th className="text-left">
                  Categoria
                </th>

                <th className="text-left">
                  Valor
                </th>

                <th className="text-left">
                  Status
                </th>

                <th></th>
              </tr>
            </thead>

            <tbody>

              {receitas.map((item) => (

                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >

                  <td className="py-5">
                    {item.descricao}
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td className="font-semibold text-emerald-400">
                    R$ {item.valor}
                  </td>

                  <td>
                    <Badge
                      color={
                        item.status === "Pago"
                          ? "green"
                          : item.status === "Atrasado"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>

                  <td className="relative">

                    <button
                      onClick={() =>
                        setMenuAberto(
                          menuAberto === item.id
                            ? null
                            : item.id
                        )
                      }
                    >
                      <MoreVertical />
                    </button>

                    {menuAberto === item.id && (

                      <div
                        className="
                          absolute
                          right-0
                          top-10
                          bg-gradient-to-br
                          from-[#202a36]/95
                          via-[#1b2430]/96
                          to-[#151c25]/96
                          backdrop-blur-xl
                          rounded-xl
                          shadow-[0_18px_45px_rgba(0,0,0,.35)]
                          border
                          border-white/[0.07]
                          text-gray-200
                          w-44
                          z-50
                        "
                      >

                        <button
                          onClick={() => {
                            setReceitaSelecionada(item);
                            setVisualizarOpen(true);
                            setMenuAberto(null);
                          }}
                          className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-white/5
                          "
                        >
                          Visualizar
                        </button>

                        <button
                          onClick={() => {
                            setReceitaSelecionada(item);
                            setEditarOpen(true);
                            setMenuAberto(null);
                          }}
                          className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-yellow-500/10
                            text-yellow-400
                          "
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => {
                            onMarcarPago?.(item.id);
                            setMenuAberto(null);
                          }}
                          className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-green-500/10
                            text-green-400
                          "
                        >
                          Marcar Pago
                        </button>

                        <button
                          onClick={() => {
                            onDelete?.(item.id);
                            setMenuAberto(null);
                          }}
                          className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-red-500/10
                            text-red-400
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
      )}

    </Table>

    <ReceitaVisualizarModal
      isOpen={visualizarOpen}
      onClose={() =>
        setVisualizarOpen(false)
      }
      receita={receitaSelecionada}
    />

    <ReceitaEditarModal
      isOpen={editarOpen}
      onClose={() => {
        setEditarOpen(false);
      }}
      receita={receitaSelecionada}
      onSave={(dadosAtualizados) => {
        onUpdate?.(
          receitaSelecionada.id,
          dadosAtualizados
        );

        setEditarOpen(false);
      }}
    />

  </>
);
}