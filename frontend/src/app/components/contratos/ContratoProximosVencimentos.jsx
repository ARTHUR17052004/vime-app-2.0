"use client";

import {
  CalendarClock,
} from "lucide-react";

export default function ContratoProximosVencimentos({
  contratos,
}) {

  const contratosVencendo =
    contratos
      .filter(
        (c) =>
          c.status === "ATIVO"
      )
      .sort(
        (a, b) =>
          Number(a.diaVencimento) -
          Number(b.diaVencimento)
      );

  return (
    <div className="bg-white rounded-3xl shadow p-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">

          <CalendarClock className="w-6 h-6 text-yellow-700" />

        </div>

        <div>

          <h2 className="text-2xl font-bold">
            Próximos Vencimentos
          </h2>

          <p className="text-gray-500">
            Contratos ativos
          </p>

        </div>

      </div>

      {contratosVencendo.length === 0 ? (

        <div className="text-gray-500">
          Nenhum contrato ativo.
        </div>

      ) : (

        <div className="space-y-4">

          {contratosVencendo.map(
            (contrato) => (

              <div
                key={contrato.id}
                className="
                  border
                  rounded-2xl
                  p-4
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <div className="font-semibold text-gray-800">
                    {contrato.inquilinoNome}
                  </div>

                  <div className="text-sm text-gray-500">
                    {contrato.unidadeNome}
                  </div>

                </div>

                <div className="text-right">

                  <div className="font-bold text-green-700">
                    R$ {contrato.valorAluguel}
                  </div>

                  <div className="text-sm text-gray-500">
                    Dia {contrato.diaVencimento}
                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}