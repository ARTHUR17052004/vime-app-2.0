"use client";

import {
  Link2,
  ShieldCheck,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Wifi,
} from "lucide-react";

export default function TokenCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Link2
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">

            Integração Clicksign

          </h2>

          <p className="text-slate-400">

            Gerencie as credenciais e acompanhe o status da conexão.

          </p>

        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">

          <div className="flex items-center gap-2">

            <Wifi
              size={18}
              className="text-emerald-400"
            />

            <span className="font-medium text-white">

              API Online

            </span>

          </div>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4">

          <span className="text-slate-400 text-sm">

            Ambiente

          </span>

          <p className="mt-1 text-white font-semibold">

            Produção

          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4">

          <span className="text-slate-400 text-sm">

            Última sincronização

          </span>

          <p className="mt-1 text-white font-semibold">

            Hoje • 08:54

          </p>

        </div>

      </div>

      <div className="space-y-5">

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            Token da API

          </label>

          <div className="flex">

            <input
              type="password"
              value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              readOnly
              className="flex-1 rounded-l-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none"
            />

            <button className="border-y border-white/10 bg-slate-700 px-4 hover:bg-slate-600">

              <Eye size={18} className="text-white" />

            </button>

            <button className="border border-white/10 bg-slate-700 px-4 hover:bg-slate-600">

              <Copy size={18} className="text-white" />

            </button>

          </div>

        </div>

      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">

        <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 text-white hover:border-emerald-500 transition">

          <RefreshCw size={18} />

          Testar Conexão

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700 transition">

          <Save size={18} />

          Salvar

        </button>

      </div>

      <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">

        <div className="flex items-center gap-3">

          <ShieldCheck
            size={22}
            className="text-blue-400"
          />

          <div>

            <p className="font-medium text-white">

              Integração segura

            </p>

            <p className="text-sm text-slate-300">

              As credenciais são armazenadas de forma criptografada e utilizadas somente para comunicação com a API da Clicksign.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}