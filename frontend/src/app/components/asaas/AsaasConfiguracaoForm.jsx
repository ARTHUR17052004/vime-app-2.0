"use client";

import { useState } from "react";

export default function AsaasConfiguracaoForm() {
  const [mostrarApi, setMostrarApi] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200">

      <div className="px-8 py-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          Configuração da Integração
        </h2>

        <p className="text-gray-500 mt-2">
          Configure sua conta Asaas para utilização no VIME.
        </p>
      </div>

      <div className="p-8 grid md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold mb-2">
            Ambiente
          </label>

          <select className="w-full border rounded-xl p-3">
            <option>Sandbox</option>
            <option>Produção</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Wallet ID
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Wallet do proprietário"
          />
        </div>

        <div className="md:col-span-2">

          <label className="block text-sm font-semibold mb-2">
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
              className="px-5 rounded-xl border hover:bg-gray-100"
            >
              {mostrarApi ? "Ocultar" : "Mostrar"}
            </button>

          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Taxa Administrativa (%)
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Token do Webhook
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Webhook Token"
          />
        </div>

      </div>

      <div className="border-t px-8 py-6 flex flex-wrap gap-4">

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