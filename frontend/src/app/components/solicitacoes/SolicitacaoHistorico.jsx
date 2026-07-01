"use client";

export default function SolicitacaoHistorico({ historico = [] }) {
  return (
    <div className="bg-white rounded-3xl shadow border p-8">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold text-gray-900">
          Histórico
        </h2>

        <span className="text-sm text-gray-500">
          {historico.length} registro(s)
        </span>

      </div>

      {historico.length === 0 ? (

        <div className="text-center py-10 text-gray-500">
          Nenhum histórico disponível.
        </div>

      ) : (

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">

          {historico.map((item, index) => (

            <div
              key={index}
              className="
                border-l-4
                border-green-600
                bg-gray-50
                rounded-r-2xl
                p-5
              "
            >

              <p className="text-sm text-gray-500">
                {item.data}
              </p>

              <p className="mt-2 text-gray-800">
                {item.descricao}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}