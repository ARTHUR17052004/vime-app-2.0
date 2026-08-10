"use client";

import {
  Webhook,
  CheckCircle2,
  Save,
  Wifi,
} from "lucide-react";

export default function WebhookCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Webhook
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">

            Webhooks

          </h2>

          <p className="text-slate-400">

            Eventos enviados automaticamente pela Clicksign ao VIME.

          </p>

        </div>

      </div>

      <div className="space-y-5">

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            URL do Webhook

          </label>

          <input
            type="text"
            placeholder="https://vimesistema.online/api/clicksign/webhook"
            className="w-full rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white outline-none transition focus:border-emerald-500"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm text-slate-300">

            Eventos Monitorados

          </label>

          <div className="grid gap-3 md:grid-cols-2">

            {[
              "Documento Criado",
              "Documento Assinado",
              "Documento Recusado",
              "Documento Cancelado",
              "Documento Expirado",
              "Assinante Adicionado",
            ].map((evento, index) => (

              <label
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/40 p-3 text-white"
              >

                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-emerald-500"
                />

                {evento}

              </label>

            ))}

          </div>

        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">

          <div className="flex items-center gap-3">

            <Wifi
              size={20}
              className="text-emerald-400"
            />

            <div>

              <p className="font-semibold text-white">

                Status da Integração

              </p>

              <p className="text-sm text-slate-300">

                Webhook conectado e aguardando eventos.

              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">

        <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 text-white transition hover:border-emerald-500">

          <CheckCircle2 size={18} />

          Testar Webhook

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-700">

          <Save size={18} />

          Salvar

        </button>

      </div>

    </div>
  );
}