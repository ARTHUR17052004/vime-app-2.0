"use client";

import { Wand2 } from "lucide-react";

export default function PersonalizacaoCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">

          <Wand2
            size={24}
            className="text-pink-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Personalização

          </h2>

          <p className="text-sm text-gray-400">

            Customize a identidade visual do sistema.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="text-sm text-gray-300">

            Nome do Sistema

          </label>

          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="VIME APP 2.0"
          />

        </div>

        <div>

          <label className="text-sm text-gray-300">

            Nome da Empresa

          </label>

          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Minha Imobiliária"
          />

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">

        <div>

          <label className="text-sm text-gray-300">

            Texto da Tela de Login

          </label>

          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Bem-vindo ao VIME APP"
          />

        </div>

        <div>

          <label className="text-sm text-gray-300">

            Texto do Rodapé

          </label>

          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="© VIME APP 2026"
          />

        </div>

      </div>

      <div className="mt-5">

        <label className="text-sm text-gray-300">

          Mensagem de Boas-vindas

        </label>

        <textarea
          rows={4}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white resize-none"
          placeholder="Escreva uma mensagem para aparecer na tela inicial..."
        />

      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-5">

        <h3 className="text-white font-semibold">

          Pré-visualização

        </h3>

        <p className="text-sm text-gray-400 mt-2">

          VIME APP 2.0

        </p>

        <p className="text-xs text-gray-500 mt-1">

          Bem-vindo ao sistema de gestão imobiliária.

        </p>

      </div>

      <button className="mt-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 text-white">

        Salvar Personalização

      </button>

    </div>
  );
}