"use client";

export default function OcorrenciaChat() {

  return (

    <div className="bg-white rounded-3xl shadow p-8">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Conversa
      </h2>

      <div className="space-y-4">

        <div className="bg-gray-100 rounded-2xl p-5">
          <div className="font-semibold text-gray-900">
            Morador
          </div>

          <div className="text-gray-800 mt-2">
            Boa tarde, minha telha quebrou.
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-5">
          <div className="font-semibold text-green-700">
            Administração
          </div>

          <div className="text-gray-900 mt-2">
            Vamos enviar um colaborador.
          </div>
        </div>

      </div>

    </div>

  );

}