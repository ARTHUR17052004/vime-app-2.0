"use client";

export default function AsaasDetalhesModal() {
  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07]">

      <div className="px-6 py-5 border-b border-white/[0.07]">
        <h2 className="text-xl font-bold text-white">
          Detalhes da Cobrança
        </h2>

        <p className="text-gray-400 mt-1">
          Visualização completa das informações da transação.
        </p>
      </div>

      <div className="p-6 space-y-6">

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="text-sm font-semibold text-gray-400">
              Cliente
            </label>

            <p className="mt-2 font-semibold text-white">
              João Silva
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400">
              Documento
            </label>

            <p className="mt-2 font-semibold text-white">
              123.456.789-00
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400">
              Valor
            </label>

            <p className="mt-2 text-2xl font-bold text-green-400">
              R$ 950,00
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400">
              Status
            </label>

            <div className="mt-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                Recebido
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400">
              Forma de Pagamento
            </label>

            <p className="mt-2 text-gray-200">
              PIX
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-400">
              Vencimento
            </label>

            <p className="mt-2 text-gray-200">
              10/07/2026
            </p>
          </div>

        </div>

        <div className="border border-white/[0.07] rounded-xl p-5">

          <h3 className="font-bold text-white mb-4">
            Histórico
          </h3>

          <ul className="space-y-3 text-gray-300">

            <li>✔ Cobrança criada</li>

            <li>✔ Cliente notificado</li>

            <li>✔ Pagamento confirmado</li>

            <li>✔ Webhook recebido</li>

          </ul>

        </div>

      </div>

      <div className="border-t border-white/[0.07] px-6 py-5 flex justify-end gap-4">

        <button
          className="
          border
          border-white/[0.07]
          text-gray-200
          rounded-xl
          px-5
          py-3
          hover:bg-white/5
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