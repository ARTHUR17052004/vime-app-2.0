"use client";

import {
  Database,
  Activity,
  HardDrive,
  Clock3,
  Wifi,
  RefreshCcw,
} from "lucide-react";

export default function BancoDadosCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">

          <Database
            size={24}
            className="text-indigo-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Banco de Dados

          </h2>

          <p className="text-sm text-gray-400">

            Informações da conexão e desempenho do PostgreSQL.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <Wifi className="text-emerald-400 mb-3" />

          <p className="text-gray-400 text-sm">

            Status

          </p>

          <h3 className="text-emerald-400 font-semibold mt-1">

            Online

          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <Activity className="text-cyan-400 mb-3" />

          <p className="text-gray-400 text-sm">

            Ping

          </p>

          <h3 className="text-white font-semibold mt-1">

            18 ms

          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <HardDrive className="text-yellow-400 mb-3" />

          <p className="text-gray-400 text-sm">

            Espaço Utilizado

          </p>

          <h3 className="text-white font-semibold mt-1">

            2.4 GB

          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <Clock3 className="text-purple-400 mb-3" />

          <p className="text-gray-400 text-sm">

            Última Sincronização

          </p>

          <h3 className="text-white font-semibold mt-1">

            Agora mesmo

          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <Database className="text-pink-400 mb-3" />

          <p className="text-gray-400 text-sm">

            Banco

          </p>

          <h3 className="text-white font-semibold mt-1">

            PostgreSQL

          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <RefreshCcw className="text-orange-400 mb-3" />

          <p className="text-gray-400 text-sm">

            Último Backup

          </p>

          <h3 className="text-white font-semibold mt-1">

            Hoje • 03:00

          </h3>

        </div>

      </div>

      <div className="flex flex-wrap gap-4 mt-8">

        <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 text-white">

          Atualizar Informações

        </button>

        <button className="rounded-xl border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition px-6 py-3">

          Testar Conexão

        </button>

      </div>

    </div>
  );
}