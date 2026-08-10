"use client";

import { Palette, Moon, Sun, Monitor } from "lucide-react";

export default function TemaCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">

          <Palette
            size={24}
            className="text-purple-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Tema do Sistema

          </h2>

          <p className="text-sm text-gray-400">

            Escolha a aparência do VIME APP.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-5">

        <button className="rounded-2xl border border-white/10 bg-slate-800/70 p-6 hover:border-emerald-500 transition-all">

          <Sun
            size={34}
            className="mx-auto text-yellow-400"
          />

          <p className="mt-4 text-white font-medium">

            Claro

          </p>

        </button>

        <button className="rounded-2xl border border-emerald-500 bg-slate-800/70 p-6">

          <Moon
            size={34}
            className="mx-auto text-emerald-400"
          />

          <p className="mt-4 text-white font-medium">

            Escuro

          </p>

        </button>

        <button className="rounded-2xl border border-white/10 bg-slate-800/70 p-6 hover:border-emerald-500 transition-all">

          <Monitor
            size={34}
            className="mx-auto text-cyan-400"
          />

          <p className="mt-4 text-white font-medium">

            Automático

          </p>

        </button>

      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">

        <div>

          <label className="text-sm text-gray-300">

            Cor Principal

          </label>

          <input
            type="color"
            defaultValue="#10b981"
            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-transparent cursor-pointer"
          />

        </div>

        <div>

          <label className="text-sm text-gray-300">

            Cor Secundária

          </label>

          <input
            type="color"
            defaultValue="#1e293b"
            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-transparent cursor-pointer"
          />

        </div>

      </div>

      <button className="mt-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 text-white">

        Salvar Tema

      </button>

    </div>
  );
}