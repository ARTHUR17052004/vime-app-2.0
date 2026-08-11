"use client";

export default function ContratoHistoricoCard({
  contrato,
}) {
  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">
        Histórico do Contrato
      </h2>

      <div className="space-y-4">

        <div className="border border-white/10 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">
            Data de início
          </p>

          <div className="font-semibold text-white">
            {contrato.dataInicio}
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">
            Data de término
          </p>

          <div className="font-semibold text-white">
            {contrato.dataFim}
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">
            Status
          </p>

          <div className="font-semibold text-white">
            {contrato.status}
          </div>
        </div>

      </div>

    </div>
  );
}