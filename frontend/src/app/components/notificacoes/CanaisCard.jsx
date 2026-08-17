"use client";

import {
  Bell,
  MessageCircle,
  Mail,
  Smartphone,
} from "lucide-react";

const canais = [
  {
    nome: "WhatsApp",
    descricao: "Enviar mensagens pelo WhatsApp.",
    icone: MessageCircle,
    ativo: true,
  },
  {
    nome: "E-mail",
    descricao: "Enviar notificações por e-mail.",
    icone: Mail,
    ativo: true,
  },
  {
    nome: "Sistema",
    descricao: "Exibir alertas internos no sistema.",
    icone: Bell,
    ativo: true,
  },
  {
    nome: "Push",
    descricao: "Enviar notificações Push.",
    icone: Smartphone,
    ativo: false,
  },
];

export default function CanaisCard() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          Canais de Notificação
        </h2>

        <p className="text-slate-400">
          Ative ou desative os canais disponíveis.
        </p>
      </div>

      <div className="space-y-4">

        {canais.map((canal, index) => {

          const Icon = canal.icone;

          return (

            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

                  <Icon
                    size={24}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-[var(--text)]">
                    {canal.nome}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {canal.descricao}
                  </p>

                </div>

              </div>

              <button
                className={`h-7 w-14 rounded-full transition ${
                  canal.ativo
                    ? "bg-emerald-500"
                    : "bg-slate-600"
                }`}
              >

                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    canal.ativo
                      ? "translate-x-7"
                      : "translate-x-0"
                  }`}
                />

              </button>

            </div>

          );

        })}

      </div>

    </div>
  );
}