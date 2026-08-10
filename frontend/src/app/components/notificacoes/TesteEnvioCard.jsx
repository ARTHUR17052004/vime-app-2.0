"use client";

import { useState } from "react";
import {
  Send,
  MessageCircle,
  Mail,
  Bell,
} from "lucide-react";

export default function TesteEnvioCard() {

  const [mensagem, setMensagem] = useState(
    "Olá! Esta é uma mensagem de teste do VIME APP 2.0."
  );

  return (

    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Send
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">

            Teste de Envio

          </h2>

          <p className="text-slate-400">

            Faça testes rápidos antes de colocar as notificações em produção.

          </p>

        </div>

      </div>

      <div className="space-y-5">

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            WhatsApp

          </label>

          <input
            type="text"
            placeholder="(99) 99999-9999"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            E-mail

          </label>

          <input
            type="email"
            placeholder="usuario@email.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            Mensagem

          </label>

          <textarea
            rows={5}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500 resize-none"
          />

        </div>

      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">

        <button className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700">

          <MessageCircle size={20} />

          Enviar WhatsApp

        </button>

        <button className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700">

          <Mail size={20} />

          Enviar E-mail

        </button>

        <button className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">

          <Bell size={20} />

          Sistema

        </button>

      </div>

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">

        <p className="text-sm text-slate-300">

          Os envios realizados aqui servem apenas para validar a configuração dos canais e não ficam registrados como notificações oficiais.

        </p>

      </div>

    </div>

  );

}