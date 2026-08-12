"use client";

import {
  LayoutTemplate,
} from "lucide-react";

export default function TemplatesCard() {
  return (
    <div id="clicksign-templates" className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

            <LayoutTemplate
              size={25}
              className="text-emerald-400"
            />

            Templates

          </h2>

          <p className="text-slate-400">

            Modelos prontos para envio de documentos.

          </p>

        </div>

        <button
          disabled
          title="Gerenciamento de templates ainda não está conectado à API da Clicksign."
          className="flex items-center gap-2 rounded-2xl bg-slate-700 px-5 py-3 text-slate-400 cursor-not-allowed"
        >
          Em breve
        </button>

      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-8 text-center">

        <p className="text-slate-400">

          O gerenciamento de templates da Clicksign ainda não foi conectado nesta versão. Por enquanto, envie documentos diretamente pela aba "Documentos".

        </p>

      </div>

    </div>
  );
}
