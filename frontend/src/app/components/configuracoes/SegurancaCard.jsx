"use client";

import {
  ShieldCheck,
  Lock,
  KeyRound,
  TimerReset,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

export default function SegurancaCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">

          <ShieldCheck
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">
            Segurança
          </h2>

          <p className="text-sm text-gray-400">
            Controle as políticas de acesso do sistema.
          </p>

        </div>

      </div>

      <div className="space-y-5">

        <div className="flex justify-between items-center rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <div className="flex gap-4 items-center">

            <Lock className="text-emerald-400" />

            <div>

              <h3 className="text-white font-medium">
                Exigir senha forte
              </h3>

              <p className="text-sm text-gray-400">
                Obriga senhas com maior nível de segurança.
              </p>

            </div>

          </div>

          <input type="checkbox" defaultChecked className="scale-125" />

        </div>

        <div className="flex justify-between items-center rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <div className="flex gap-4 items-center">

            <KeyRound className="text-cyan-400" />

            <div>

              <h3 className="text-white font-medium">
                Autenticação em Dois Fatores
              </h3>

              <p className="text-sm text-gray-400">
                Exigir confirmação adicional no login.
              </p>

            </div>

          </div>

          <input type="checkbox" className="scale-125" />

        </div>

        <div className="flex justify-between items-center rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <div className="flex gap-4 items-center">

            <TimerReset className="text-yellow-400" />

            <div>

              <h3 className="text-white font-medium">
                Logout Automático
              </h3>

              <p className="text-sm text-gray-400">
                Encerrar sessão após período sem uso.
              </p>

            </div>

          </div>

          <select className="rounded-xl border border-white/10 bg-slate-900 p-2 text-white">

            <option>15 min</option>
            <option>30 min</option>
            <option>1 hora</option>
            <option>2 horas</option>

          </select>

        </div>

        <div className="flex justify-between items-center rounded-2xl border border-white/10 bg-slate-800/60 p-5">

          <div className="flex gap-4 items-center">

            <Smartphone className="text-purple-400" />

            <div>

              <h3 className="text-white font-medium">
                Permitir Login Mobile
              </h3>

              <p className="text-sm text-gray-400">
                Autoriza acesso por smartphones.
              </p>

            </div>

          </div>

          <input type="checkbox" defaultChecked className="scale-125" />

        </div>

      </div>

      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">

        <div className="flex gap-3 items-center">

          <AlertTriangle
            className="text-yellow-400"
            size={22}
          />

          <div>

            <h3 className="text-yellow-300 font-semibold">

              Recomendação

            </h3>

            <p className="text-sm text-gray-300 mt-1">

              Ative a autenticação em dois fatores para aumentar a segurança do sistema.

            </p>

          </div>

        </div>

      </div>

      <button className="mt-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 text-white">

        Salvar Configurações

      </button>

    </div>
  );
}