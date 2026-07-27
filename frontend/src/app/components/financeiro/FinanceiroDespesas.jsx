"use client";

import { useState } from "react";
import {
  MoreVertical,
  TrendingDown,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";

import DespesaVisualizarModal from "./DespesaVisualizarModal";
import DespesaEditarModal from "./DespesaEditarModal";

export default function FinanceiroDespesas({
  despesas,
  onDelete,
  onUpdate,
}) {
  const [menuAberto, setMenuAberto] =
    useState(null);

  const [despesaSelecionada, setDespesaSelecionada] =
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
              bg-red-500/10
              border
              border-red-500/20
              flex
              items-center
              justify-center
            "
          >
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Despesas
            </h2>

            <p className="text-gray-400">
              Controle das despesas cadastradas.
            </p>

          </div>

        </div>

      </div>

      {despesas.length === 0 ? (

        <div className="px-6 pb-6 text-gray-500">
          Nenhuma despesa cadastrada.
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

              {despesas.map((item) => (

                <tr
                  key={item.id}
                  className="
                    border-b
                    border-white/5
                    hover:bg-white/5
                    transition
                  "
                >

                  <td className="py-5">
                    {item.descricao}
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td className="font-semibold text-red-400">
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
                          bg-white
                          rounded-xl
                          shadow-xl
                          border
                          w-44
                          z-50
                        "
                      >

                        <button
                          onClick={() => {
                            setDespesaSelecionada(item);
                            setVisualizarOpen(true);
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
                          Visualizar
                        </button>

                        <button
                          onClick={() => {
                            setDespesaSelecionada(item);
                            setEditarOpen(true);
                            setMenuAberto(null);
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
                            onDelete?.(item.id);
                            setMenuAberto(null);
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

      )}

    </Table>

    <DespesaVisualizarModal
      isOpen={visualizarOpen}
      onClose={() =>
        setVisualizarOpen(false)
      }
      despesa={despesaSelecionada}
    />

    <DespesaEditarModal
      isOpen={editarOpen}
      onClose={() => {
        setEditarOpen(false);
      }}
      despesa={despesaSelecionada}
      onSave={(dadosAtualizados) => {
        onUpdate?.(
          despesaSelecionada.id,
          dadosAtualizados
        );

        setEditarOpen(false);
      }}
    />

  </>
);
}