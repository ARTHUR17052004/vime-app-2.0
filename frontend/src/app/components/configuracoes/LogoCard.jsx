"use client";

import { Image, UploadCloud } from "lucide-react";

export default function LogoCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <Image size={24} className="text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Logo do Sistema
          </h2>

          <p className="text-sm text-gray-400">
            Defina a identidade visual da empresa.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/50 h-48 flex flex-col items-center justify-center text-gray-400">

          <UploadCloud size={42} />

          <p className="mt-4 text-sm">
            Clique para enviar uma logo
          </p>

        </div>

        <div className="space-y-4">

          <div>
            <label className="text-gray-300 text-sm">
              Nome da Empresa
            </label>

            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
              placeholder="VIME APP"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">
              Favicon
            </label>

            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
              placeholder="favicon.ico"
            />
          </div>

          <button className="mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 text-white">
            Salvar Alterações
          </button>

        </div>

      </div>

    </div>
  );
}