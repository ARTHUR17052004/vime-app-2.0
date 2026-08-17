"use client";

import {
  Clock3,
  CalendarDays,
  TimerReset,
} from "lucide-react";

export default function HorariosCard() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Clock3
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">
            Horários de Envio
          </h2>

          <p className="text-slate-400">
            Defina quando o sistema poderá enviar notificações.
          </p>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Início do Expediente
          </label>

          <input
            type="time"
            defaultValue="08:00"
            className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Fim do Expediente
          </label>

          <input
            type="time"
            defaultValue="18:00"
            className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none transition focus:border-emerald-500"
          />

        </div>

        <div className="md:col-span-2">

          <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">

            <CalendarDays size={18} />

            Dias Permitidos

          </label>

          <div className="flex flex-wrap gap-2">

            {[
              "Seg",
              "Ter",
              "Qua",
              "Qui",
              "Sex",
              "Sáb",
              "Dom",
            ].map((dia) => (
              <button
                key={dia}
                className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-4 py-2 text-[var(--text)] transition hover:border-emerald-500 hover:bg-slate-700"
              >
                {dia}
              </button>
            ))}

          </div>

        </div>

        <div className="md:col-span-2">

          <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">

            <TimerReset size={18} />

            Intervalo mínimo entre notificações (minutos)

          </label>

          <input
            type="number"
            defaultValue="5"
            className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none transition focus:border-emerald-500"
          />

        </div>

      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">

        <p className="text-sm text-slate-300">
          O sistema bloqueará envios fora dos horários configurados.
        </p>

        <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-[var(--text)] transition hover:bg-emerald-700">

          Salvar Horários

        </button>

      </div>

    </div>
  );
}