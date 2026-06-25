"use client";

export default function FinanceiroAsaas() {
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-3xl shadow p-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Integração Asaas
        </h2>

        <p className="text-gray-500 mt-2">
          Módulo preparado para integração financeira.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="font-bold text-xl text-gray-800">
            Subcontas
          </h3>

          <p className="text-gray-500 mt-3">
            Gestão das subcontas dos locadores.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="font-bold text-xl text-gray-800">
            Cobranças
          </h3>

          <p className="text-gray-500 mt-3">
            Boletos, PIX e cobranças automáticas.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="font-bold text-xl text-gray-800">
            PIX
          </h3>

          <p className="text-gray-500 mt-3">
            Recebimentos instantâneos.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="font-bold text-xl text-gray-800">
            Assinaturas
          </h3>

          <p className="text-gray-500 mt-3">
            Cobranças recorrentes.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="font-bold text-xl text-gray-800">
            Logs
          </h3>

          <p className="text-gray-500 mt-3">
            Histórico das integrações.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="font-bold text-xl text-gray-800">
            Status
          </h3>

          <div className="mt-4">
            <span className="px-4 py-2 rounded-2xl bg-yellow-100 text-yellow-700 font-medium">
              Em Desenvolvimento
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}