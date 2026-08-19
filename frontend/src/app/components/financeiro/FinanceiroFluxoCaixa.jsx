"use client";

import {
  Landmark,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";

export default function FinanceiroFluxoCaixa({
  receitas,
  despesas,
}) {

  const movimentos = [

    ...receitas.map((item) => ({
      ...item,
      tipo: "Receita",
    })),

    ...despesas.map((item) => ({
      ...item,
      tipo: "Despesa",
    })),

  ];

  movimentos.sort((a, b) => b.id - a.id);

  return (

    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-blue-500/10

              border
              border-blue-500/20

              flex
              items-center
              justify-center
            "
          >

            <Landmark className="w-6 h-6 text-blue-400" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[var(--text)]">
              Fluxo de Caixa
            </h2>

            <p className="text-[var(--text-subtle)]">
              Histórico completo de movimentações.
            </p>

          </div>

        </div>

      </div>

      {movimentos.length === 0 ? (

        <div className="px-6 py-12 text-center text-[var(--text-subtle)]">
          Nenhum lançamento encontrado.
        </div>

      ) : (

        <div className="overflow-x-auto mt-6 px-6 pb-6">

          <table className="w-full text-[var(--text-1)]">

            <thead
              className="
                border-b
                border-[var(--border-token)]

                text-[var(--text-subtle)]

                uppercase

                tracking-[0.22em]

                text-xs
              "
            >

              <tr>

                <th className="text-left py-4">
                  Tipo
                </th>

                <th className="text-left">
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

              </tr>

            </thead>

            <tbody>

              {movimentos.map((item) => (

                <tr
                  key={`${item.tipo}-${item.id}`}
                  className="
                    border-b
                    border-[var(--border-token)]

                    hover:bg-[var(--surface-2)]

                    transition
                  "
                >

                  <td className="py-5">

                    <Badge
                      color={
                        item.tipo === "Receita"
                          ? "green"
                          : "red"
                      }
                    >
                      {item.tipo}
                    </Badge>

                  </td>

                  <td>
                    {item.descricao}
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td
                    className={`font-semibold ${
                      item.status === "ATRASADA"
                        ? "text-red-400"
                        : item.tipo === "Receita"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    R$ {item.valor}
                  </td>

                  <td>

                    <Badge
                      color={
                        item.status === "PAGO"
                          ? "green"
                          : item.status === "ATRASADA"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {item.status}
                    </Badge>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </Table>

  );

}