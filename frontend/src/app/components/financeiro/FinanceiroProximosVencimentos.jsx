"use client";

import { CalendarClock } from "lucide-react";

import Table from "../ui/Table";

export default function FinanceiroProximosVencimentos({
  receitas,
}) {
  const vencimentos = receitas.filter(
    (item) => item.status !== "PAGO"
  );

  return (
    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-yellow-500/10

              border
              border-yellow-500/20

              flex
              items-center
              justify-center
            "
          >
            <CalendarClock className="w-6 h-6 text-yellow-400" />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-[var(--text)]">
              Próximos Vencimentos
            </h2>

            <p className="text-[var(--text-subtle)]">
              Receitas aguardando pagamento.
            </p>

          </div>

        </div>

      </div>

      <div className="p-6">

        {vencimentos.length === 0 ? (

          <div className="text-center text-[var(--text-subtle)] py-10">
            Nenhum vencimento pendente.
          </div>

        ) : (

          <div className="space-y-4">

            {vencimentos.map((item) => (

              <div
                key={item.id}
                className="
                  rounded-2xl

                  border
                  border-[var(--border-token)]

                  bg-[var(--surface-2)]

                  p-5

                  flex
                  items-center
                  justify-between

                  hover:bg-[var(--surface-2)]

                  transition
                "
              >

                <div>

                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {item.unidade || item.descricao}
                  </h3>

                  <p className="text-sm text-[var(--text-subtle)]">
                    {item.categoria}
                  </p>

                  <p className="text-sm text-[var(--text-faint)] mt-1">
                    Vencimento: {item.vencimento
                      ? new Date(item.vencimento).toLocaleDateString("pt-BR")
                      : "-"}
                  </p>

                </div>

                <div className="text-right">

                  <div className="text-2xl font-bold text-emerald-400">
                    R$ {item.valor}
                  </div>

                  <div
                    className={`mt-2 text-sm font-medium ${
                      item.status === "ATRASADA"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.status}
                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </Table>
  );
}