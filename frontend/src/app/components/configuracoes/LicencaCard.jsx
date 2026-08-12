"use client";

import { KeyRound, CalendarDays, ShieldCheck } from "lucide-react";

export default function LicencaCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
          <KeyRound className="h-6 w-6 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Licença do Sistema
          </h2>

          <p className="text-sm text-slate-400">
            Informações da licença utilizada pelo VIME APP.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Plano
          </p>

          <p className="mt-2 text-lg font-semibold text-white">
            Enterprise
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarDays size={16} />
            <span className="text-xs uppercase tracking-wide">
              Validade
            </span>
          </div>

          <p className="mt-2 text-lg font-semibold text-white">
            31/12/2026
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={16} />
            <span className="text-xs uppercase tracking-wide">
              Status
            </span>
          </div>

          <p className="mt-2 text-lg font-semibold text-emerald-300">
            Licença Ativa
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-800/30 p-4">
        <p className="text-sm text-slate-300">
          A licença controla os recursos premium, integrações e atualizações do
          sistema. Nesta primeira versão os dados são apenas ilustrativos e,
          futuramente, serão carregados automaticamente pelo backend.
        </p>
      </div>
    </div>
  );
}