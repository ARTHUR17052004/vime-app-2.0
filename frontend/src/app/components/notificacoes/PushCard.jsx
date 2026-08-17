"use client";

import {
  Smartphone,
  Bell,
  Volume2,
  Vibrate,
  MonitorSmartphone,
} from "lucide-react";

const configuracoes = [
  {
    titulo: "Ativar Push",
    descricao: "Permitir notificações Push.",
    icone: Bell,
    ativo: true,
  },
  {
    titulo: "Som",
    descricao: "Emitir som ao receber notificações.",
    icone: Volume2,
    ativo: true,
  },
  {
    titulo: "Vibração",
    descricao: "Vibrar dispositivos compatíveis.",
    icone: Vibrate,
    ativo: false,
  },
  {
    titulo: "Desktop",
    descricao: "Permitir notificações no navegador.",
    icone: MonitorSmartphone,
    ativo: true,
  },
];

export default function PushCard() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Smartphone
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">
            Notificações Push
          </h2>

          <p className="text-slate-400">
            Configure como as notificações Push serão exibidas.
          </p>

        </div>

      </div>

      <div className="space-y-4">

        {configuracoes.map((item, index) => {

          const Icon = item.icone;

          return (

            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

                  <Icon
                    size={22}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-[var(--text)]">
                    {item.titulo}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {item.descricao}
                  </p>

                </div>

              </div>

              <button
                className={`h-7 w-14 rounded-full transition ${
                  item.ativo
                    ? "bg-emerald-500"
                    : "bg-slate-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    item.ativo
                      ? "translate-x-7"
                      : "translate-x-0"
                  }`}
                />
              </button>

            </div>

          );

        })}

      </div>

      <div className="mt-6 flex justify-end">

        <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-[var(--text)] transition hover:bg-emerald-700">

          Salvar Configurações

        </button>

      </div>

    </div>
  );
}