"use client";

export default function OcorrenciaChat() {

  return (

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">
        Conversa
      </h2>

      <div className="space-y-4">

        <div className="bg-white/5 rounded-2xl p-5">
          <div className="font-semibold text-white">
            Morador
          </div>

          <div className="text-gray-200 mt-2">
            Boa tarde, minha telha quebrou.
          </div>
        </div>

        <div className="bg-emerald-500/10 rounded-2xl p-5">
          <div className="font-semibold text-emerald-400">
            Administração
          </div>

          <div className="text-gray-200 mt-2">
            Vamos enviar um colaborador.
          </div>
        </div>

      </div>

    </div>

  );

}