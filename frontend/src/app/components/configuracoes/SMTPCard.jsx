"use client";

import {
  Mail,
  Send,
  ShieldCheck,
  Server,
} from "lucide-react";

export default function SMTPCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">

          <Mail
            size={24}
            className="text-blue-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Configuração SMTP

          </h2>

          <p className="text-sm text-gray-400">

            Configure o servidor responsável pelo envio de e-mails.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="text-sm text-gray-300">

            Servidor SMTP

          </label>

          <input
            placeholder="smtp.gmail.com"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
          />

        </div>

        <div>

          <label className="text-sm text-gray-300">

            Porta

          </label>

          <input
            placeholder="587"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
          />

        </div>

        <div>

          <label className="text-sm text-gray-300">

            E-mail

          </label>

          <input
            placeholder="contato@empresa.com"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
          />

        </div>

        <div>

          <label className="text-sm text-gray-300">

            Senha

          </label>

          <input
            type="password"
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
          />

        </div>

      </div>

      <div className="mt-6 flex flex-wrap gap-4">

        <label className="flex items-center gap-2 text-gray-300">

          <input type="checkbox" />

          SSL

        </label>

        <label className="flex items-center gap-2 text-gray-300">

          <input type="checkbox" defaultChecked />

          TLS

        </label>

        <label className="flex items-center gap-2 text-gray-300">

          <input type="checkbox" defaultChecked />

          Autenticação

        </label>

      </div>

      <div className="mt-8 flex flex-wrap gap-4">

        <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 text-white flex items-center gap-2">

          <ShieldCheck size={18} />

          Salvar

        </button>

        <button className="rounded-xl border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition px-6 py-3 flex items-center gap-2">

          <Send size={18} />

          Testar Envio

        </button>

        <button className="rounded-xl border border-white/10 hover:border-white/30 transition px-6 py-3 text-gray-300 flex items-center gap-2">

          <Server size={18} />

          Verificar Servidor

        </button>

      </div>

    </div>
  );
}