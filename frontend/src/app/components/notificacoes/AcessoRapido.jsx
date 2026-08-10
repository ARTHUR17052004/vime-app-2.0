"use client";

import {
  MessageCircle,
  Mail,
  Bell,
  FileText,
  Clock3,
  Settings,
  ArrowRight,
} from "lucide-react";

const atalhos = [
  {
    titulo: "WhatsApp",
    descricao: "Configurar envio pelo WhatsApp.",
    icone: MessageCircle,
    cor: "text-green-400",
  },
  {
    titulo: "E-mail",
    descricao: "Servidor SMTP e autenticação.",
    icone: Mail,
    cor: "text-blue-400",
  },
  {
    titulo: "Notificações",
    descricao: "Mensagens internas do sistema.",
    icone: Bell,
    cor: "text-yellow-400",
  },
  {
    titulo: "Templates",
    descricao: "Modelos de mensagens.",
    icone: FileText,
    cor: "text-purple-400",
  },
  {
    titulo: "Horários",
    descricao: "Janelas de envio.",
    icone: Clock3,
    cor: "text-cyan-400",
  },
  {
    titulo: "Configurações",
    descricao: "Preferências gerais.",
    icone: Settings,
    cor: "text-emerald-400",
  },
];

export default function AcessoRapido() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-5">

        <h2 className="text-2xl font-bold text-white">
          Acesso Rápido
        </h2>

        <p className="text-slate-400">
          Principais áreas do módulo de notificações.
        </p>

      </div>

      <div className="space-y-3">

        {atalhos.map((item, index) => {

          const Icon = item.icone;

          return (

            <button
              key={index}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-800/40 p-4 transition hover:border-emerald-500/30 hover:bg-slate-800"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900">

                  <Icon
                    size={22}
                    className={item.cor}
                  />

                </div>

                <div className="text-left">

                  <h3 className="font-semibold text-white">
                    {item.titulo}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {item.descricao}
                  </p>

                </div>

              </div>

              <ArrowRight
                size={18}
                className="text-slate-500"
              />

            </button>

          );

        })}

      </div>

    </div>
  );
}