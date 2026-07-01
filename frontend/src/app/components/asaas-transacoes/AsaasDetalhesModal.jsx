"use client";

export default function AsaasDetalhesModal() {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200">

      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          Detalhes da Cobrança
        </h2>

        <p className="text-gray-500 mt-1">
          Visualização completa das informações da transação.
        </p>
      </div>

      <div className="p-6 space-y-6">

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="text-sm font-semibold text-gray-500">
              Cliente
            </label>

            <p className="mt-2 font-semibold text-gray-800">
              João Silva
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">
              Documento
            </label>

            <p className="mt-2 font-semibold text-gray-800">
              123.456.789-00
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">
              Valor
            </label>

            <p className="mt-2 text-2xl font-bold text-green-700">
              R$ 950,00
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">
              Status
            </label>

            <div className="mt-2">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                Recebido
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">
              Forma de Pagamento
            </label>

            <p className="mt-2 text-gray-800">
              PIX
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">
              Vencimento
            </label>

            <p className="mt-2 text-gray-800">
              10/07/2026
            </p>
          </div>

        </div>

        <div className="border rounded-xl p-5">

          <h3 className="font-bold text-gray-800 mb-4">
            Histórico
          </h3>

          <ul className="space-y-3 text-gray-600">

            <li>✔ Cobrança criada</li>

            <li>✔ Cliente notificado</li>

            <li>✔ Pagamento confirmado</li>

            <li>✔ Webhook recebido</li>

          </ul>

        </div>

      </div>

      <div className="border-t px-6 py-5 flex justify-end gap-4">

        <button
          className="
          border
          rounded-xl
          px-5
          py-3
          hover:bg-gray-100
          "
        >
          Fechar
        </button>

        <button
          className="
          bg-green-700
          hover:bg-green-800
          text-white
          rounded-xl
          px-5
          py-3
          "
        >
          Abrir no Asaas
        </button>

      </div>

    </div>
  );
}