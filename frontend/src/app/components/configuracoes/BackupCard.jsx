"use client";

import {
  DatabaseBackup,
  Download,
  Upload,
  RefreshCcw,
  CalendarClock,
  HardDrive,
} from "lucide-react";

export default function BackupCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">

          <DatabaseBackup
            size={24}
            className="text-cyan-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Backup do Sistema

          </h2>

          <p className="text-sm text-gray-400">

            Gerencie as cópias de segurança do VIME.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <CalendarClock className="text-cyan-400 mb-3" />

          <p className="text-gray-400 text-sm">
            Último Backup
          </p>

          <h3 className="text-white font-semibold mt-1">
            Hoje • 03:00
          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <HardDrive className="text-emerald-400 mb-3" />

          <p className="text-gray-400 text-sm">
            Tamanho
          </p>

          <h3 className="text-white font-semibold mt-1">
            328 MB
          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <RefreshCcw className="text-yellow-400 mb-3" />

          <p className="text-gray-400 text-sm">
            Backup Automático
          </p>

          <h3 className="text-emerald-400 font-semibold mt-1">
            Ativado
          </h3>

        </div>

      </div>

      <div className="flex flex-wrap gap-4">

        <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-white flex items-center gap-2">

          <DatabaseBackup size={18} />

          Fazer Backup

        </button>

        <button className="rounded-xl border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-6 py-3 flex items-center gap-2">

          <Download size={18} />

          Baixar Backup

        </button>

        <button className="rounded-xl border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 px-6 py-3 flex items-center gap-2">

          <Upload size={18} />

          Restaurar Backup

        </button>

      </div>

    </div>
  );
}