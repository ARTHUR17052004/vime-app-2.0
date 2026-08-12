"use client";

import {
  Clock3,
  Building2,
  Palette,
  ShieldCheck,
  Database,
} from "lucide-react";

const historico = [
  {
    titulo: "Empresa atualizada",
    usuario: "Administrador",
    data: "Hoje • 09:45",
    icon: Building2,
    color: "text-emerald-400",
  },
  {
    titulo: "Tema alterado",
    usuario: "Administrador",
    data: "Ontem • 16:20",
    icon: Palette,
    color: "text-pink-400",
  },
  {
    titulo: "Permissões revisadas",
    usuario: "Administrador",
    data: "Ontem • 10:10",
    icon: ShieldCheck,
    color: "text-cyan-400",
  },
  {
    titulo: "Backup executado",
    usuario: "Sistema",
    data: "08/08/2026 • 03:00",
    icon: Database,
    color: "text-yellow-400",
  },
];

export default function HistoricoCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">

          <Clock3
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Histórico

          </h2>

          <p className="text-sm text-gray-400">

            Últimas alterações realizadas no sistema.

          </p>

        </div>

      </div>

      <div className="space-y-5">

        {historico.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.titulo}
              className="flex items-center gap-5 rounded-2xl border border-white/10 bg-slate-800/60 p-5 hover:border-emerald-500/30 transition-all"
            >

              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">

                <Icon
                  size={22}
                  className={item.color}
                />

              </div>

              <div className="flex-1">

                <h3 className="text-white font-medium">

                  {item.titulo}

                </h3>

                <p className="text-sm text-gray-400 mt-1">

                  {item.usuario}

                </p>

              </div>

              <span className="text-xs text-gray-500">

                {item.data}

              </span>

            </div>

          );

        })}

      </div>

    </div>
  );
}