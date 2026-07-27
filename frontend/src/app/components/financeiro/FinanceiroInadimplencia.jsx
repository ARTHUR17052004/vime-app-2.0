"use client";

import {
  AlertTriangle,
} from "lucide-react";

import Table from "../ui/Table";

export default function FinanceiroInadimplencia({
  receitas,
}) {

  const inadimplentes = receitas.filter(
    (item) =>
      item.status === "Atrasado"
  );

  const totalEmAberto = inadimplentes.reduce(
    (total, item) =>
      total + Number(item.valor || 0),
    0
  );

  const pendentes = receitas.filter(
    (item) =>
      item.status === "Pendente"
  ).length;

  return (

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

            <AlertTriangle className="w-6 h-6 text-red-400" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Inadimplência
            </h2>

            <p className="text-gray-400">
              Controle de recebimentos em atraso.
            </p>

          </div>

        </div>

      </div>

      <div className="p-6">

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div
            className="
              rounded-2xl

              border
              border-white/10

              bg-white/[0.02]

              p-5
            "
          >

            <div className="text-gray-400">
              Total em Aberto
            </div>

            <div className="text-3xl font-bold text-red-400 mt-3">
              R$ {totalEmAberto}
            </div>

          </div>

          <div
            className="
              rounded-2xl

              border
              border-white/10

              bg-white/[0.02]

              p-5
            "
          >

            <div className="text-gray-400">
              Pendentes
            </div>

            <div className="text-3xl font-bold text-yellow-400 mt-3">
              {pendentes}
            </div>

          </div>

          <div
            className="
              rounded-2xl

              border
              border-white/10

              bg-white/[0.02]

              p-5
            "
          >

            <div className="text-gray-400">
              Atrasados
            </div>

            <div className="text-3xl font-bold text-red-400 mt-3">
              {inadimplentes.length}
            </div>

          </div>

        </div>

        {inadimplentes.length === 0 ? (

          <div className="text-center text-gray-400 py-10">
            Nenhum inadimplente encontrado.
          </div>

        ) : (

          <div className="space-y-4">

            {inadimplentes.map((item) => (

              <div
                key={item.id}
                className="
                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.02]

                  p-5

                  hover:bg-white/[0.04]

                  transition
                "
              >

                <h3 className="text-lg font-semibold text-white">
                  {item.unidade || item.descricao}
                </h3>

                <p className="text-gray-400 mt-1">
                  {item.categoria}
                </p>

                <p className="text-2xl font-bold text-red-400 mt-4">
                  R$ {item.valor}
                </p>

                <p className="text-red-400 mt-2">
                  Status: {item.status}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </Table>

  );

}