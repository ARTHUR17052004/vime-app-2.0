"use client";

import { Mail, CheckCircle2 } from "lucide-react";

export default function EmailCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Mail
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            Servidor de E-mail
          </h2>

          <p className="text-slate-400">
            Configure o servidor SMTP para envio de e-mails.
          </p>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Host SMTP
          </label>

          <input
            type="text"
            placeholder="smtp.gmail.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Porta
          </label>

          <input
            type="number"
            placeholder="587"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Usuário
          </label>

          <input
            type="email"
            placeholder="email@empresa.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Senha
          </label>

          <input
            type="password"
            placeholder="********"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-400">

          <CheckCircle2 size={18} />

          <span className="text-sm">
            SMTP Configurado
          </span>

        </div>

        <div className="flex gap-3">

          <button className="rounded-2xl bg-slate-700 px-5 py-3 text-white transition hover:bg-slate-600">

            Testar SMTP

          </button>

          <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">

            Salvar

          </button>

        </div>

      </div>

    </div>
  );
}