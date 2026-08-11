"use client";

import { useState } from "react";

export default function AsaasConfiguracaoForm() {
  const [mostrarApi, setMostrarApi] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07]">

      <div className="px-8 py-6 border-b border-white/[0.07]">
        <h2 className="text-2xl font-bold text-white">
          Configuração da Integração
        </h2>

        <p className="text-gray-400 mt-2">
          Configure sua conta Asaas para utilização no VIME.
        </p>
      </div>

      <div className="p-8 grid md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Ambiente
          </label>

          <select className="w-full border border-white/[0.07] rounded-xl p-3 bg-white/5 text-white">
            <option className="bg-[#1b2430]">Sandbox</option>
            <option className="bg-[#1b2430]">Produção</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Wallet ID
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Wallet do proprietário"
          />
        </div>

        <div className="md:col-span-2">

          <label className="block text-sm font-semibold text-gray-200 mb-2">
            API Key
          </label>

          <div className="flex gap-3">

            <input
              type={mostrarApi ? "text" : "password"}
              className="flex-1 border rounded-xl p-3"
              placeholder="$aact_prod..."
            />

            <button
              onClick={() =>
                setMostrarApi(!mostrarApi)
              }
              className="px-5 rounded-xl border border-white/[0.07] text-gray-200 hover:bg-white/5"
            >
              {mostrarApi ? "Ocultar" : "Mostrar"}
            </button>

          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Taxa Administrativa (%)
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Token do Webhook
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Webhook Token"
          />
        </div>

      </div>

      <div className="border-t border-white/[0.07] px-8 py-6 flex flex-wrap gap-4">

        <button
          className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-6
          py-3
          rounded-xl
          "
        >
          Testar Conexão
        </button>

        <button
          className="
          bg-purple-600
          hover:bg-purple-700
          text-white
          px-6
          py-3
          rounded-xl
          "
        >
          Buscar Wallet
        </button>

        <button
          className="
          bg-green-700
          hover:bg-green-800
          text-white
          px-6
          py-3
          rounded-xl
          ml-auto
          "
        >
          Salvar Configuração
        </button>

      </div>

    </div>
  );
}