"use client";

export default function ContratoHistoricoCard({
  contrato,
}) {
  return (
    <div className="bg-white rounded-3xl shadow p-8">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Histórico do Contrato
      </h2>

      <div className="space-y-4">

        <div className="border rounded-2xl p-5">
          <p className="text-gray-500 text-sm">
            Data de início
          </p>

          <div className="font-semibold text-gray-800">
            {contrato.dataInicio}
          </div>
        </div>

        <div className="border rounded-2xl p-5">
          <p className="text-gray-500 text-sm">
            Data de término
          </p>

          <div className="font-semibold text-gray-800">
            {contrato.dataFim}
          </div>
        </div>

        <div className="border rounded-2xl p-5">
          <p className="text-gray-500 text-sm">
            Status
          </p>

          <div className="font-semibold text-gray-800">
            {contrato.status}
          </div>
        </div>

      </div>

    </div>
  );
}