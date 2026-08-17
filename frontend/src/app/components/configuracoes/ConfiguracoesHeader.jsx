"use client";

import { Settings } from "lucide-react";

export default function ConfiguracoesHeader() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-4">

        <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 flex items-center justify-center">

          <Settings
            size={34}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h1 className="text-3xl font-bold text-[var(--text)]">

            Configurações

          </h1>

          <p className="text-[var(--text-subtle)] mt-1">

            Gerencie todas as configurações gerais do VIME APP.

          </p>

        </div>

      </div>

    </div>
  );
}