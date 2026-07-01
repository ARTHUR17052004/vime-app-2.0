"use client";

import { useState } from "react";

export default function AsaasWebhookCard() {
  const webhook =
    "https://api.vimesistema.online/webhooks/asaas";

  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(webhook);

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200">

      <div className="px-8 py-6 border-b bg-gray-50">

        <h2 className="text-2xl font-bold text-gray-800">
          Webhook do Asaas
        </h2>

        <p className="text-gray-500 mt-2">
          Configure esta URL dentro do painel do Asaas para que o
          VIME receba automaticamente os eventos de pagamento.
        </p>

      </div>

      <div className="p-8">

        <label className="block text-sm font-semibold mb-3">
          URL do Webhook
        </label>

        <div className="flex gap-3">

          <input
            value={webhook}
            readOnly
            className="
              flex-1
              border
              rounded-xl
              p-3
              bg-gray-50
            "
          />

          <button
            onClick={copiar}
            className="
              px-5
              rounded-xl
              bg-blue-600
              text-white
              hover:bg-blue-700
            "
          >
            {copiado ? "Copiado!" : "Copiar"}
          </button>

        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">

          <button
            className="
              bg-green-700
              hover:bg-green-800
              text-white
              rounded-xl
              py-3
            "
          >
            Testar Webhook
          </button>

          <button
            className="
              bg-purple-700
              hover:bg-purple-800
              text-white
              rounded-xl
              py-3
            "
          >
            Abrir Documentação
          </button>

          <button
            className="
              border
              rounded-xl
              py-3
              hover:bg-gray-100
            "
          >
            Gerar Novo Token
          </button>

        </div>

      </div>

      <div className="border-t bg-gray-50 px-8 py-4">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-green-500" />

          <span className="font-medium text-gray-700">
            Webhook pronto para configuração.
          </span>

        </div>

      </div>

    </div>
  );
}