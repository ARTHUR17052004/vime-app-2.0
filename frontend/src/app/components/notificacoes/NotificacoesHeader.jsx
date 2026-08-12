"use client";

import { BellRing } from "lucide-react";

export default function NotificacoesHeader() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10">
        <BellRing size={34} className="text-emerald-400" />
      </div>

      <div>
        <h1 className="text-4xl font-bold text-white">
          Notificações
        </h1>

        <p className="text-slate-400">
          Gerencie todos os canais e eventos de notificações do sistema.
        </p>
      </div>
    </div>
  );
}