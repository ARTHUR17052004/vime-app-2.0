"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";

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
    <div className="bg-white rounded-3xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Despesas
      </h2>

      {despesas.length === 0 ? (
        <div className="text-gray-500">
          Nenhuma despesa cadastrada.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b text-gray-500">
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
                  className="border-b"
                >

                  <td className="py-5">
                    {item.descricao}
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td className="font-semibold text-red-600">
                    R$ {item.valor}
                  </td>

                  <td>
                    <span
                      className={`
                        px-3
                        py-1
                        rounded-xl
                        text-sm
                        ${corStatus(item.status)}
                      `}
                    >
                      {item.status}
                    </span>
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

    </div>

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