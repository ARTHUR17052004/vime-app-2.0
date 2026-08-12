"use client";

import { MessageCircle, CheckCircle2 } from "lucide-react";

export default function WhatsAppCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <MessageCircle
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            WhatsApp
          </h2>

          <p className="text-slate-400">
            Configuração da integração com WhatsApp.
          </p>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Token
          </label>

          <input
            type="password"
            placeholder="Digite o Token"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Número
          </label>

          <input
            type="text"
            placeholder="5599999999999"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div className="md:col-span-2">

          <label className="mb-2 block text-sm text-slate-300">
            Webhook
          </label>

          <input
            type="text"
            placeholder="https://api.vimesistema.online/webhook"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-400">

          <CheckCircle2 size={18} />

          <span className="text-sm">
            Conectado
          </span>

        </div>

        <div className="flex gap-3">

          <button className="rounded-2xl bg-slate-700 px-5 py-3 text-white transition hover:bg-slate-600">

            Testar Conexão

          </button>

          <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">

            Salvar

          </button>

        </div>

      </div>

    </div>
  );
}