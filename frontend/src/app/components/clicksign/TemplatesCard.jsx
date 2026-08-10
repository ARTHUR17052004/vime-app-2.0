"use client";

import {
  LayoutTemplate,
  Plus,
  FileText,
  Copy,
  Eye,
} from "lucide-react";

const templates = [
  {
    nome: "Contrato de Locação",
    descricao: "Modelo padrão para contratos de aluguel.",
    usos: 84,
  },
  {
    nome: "Aditivo Contratual",
    descricao: "Alterações em contratos existentes.",
    usos: 26,
  },
  {
    nome: "Distrato",
    descricao: "Encerramento de contrato.",
    usos: 12,
  },
];

export default function TemplatesCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

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

        <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700 transition">

          <Plus size={18} />

          Novo Template

        </button>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {templates.map((template, index) => (

          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-slate-800/40 p-5 transition hover:border-emerald-500/30 hover:-translate-y-1"
          >

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

              <FileText
                size={28}
                className="text-emerald-400"
              />

            </div>

            <h3 className="text-lg font-semibold text-white">

              {template.nome}

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              {template.descricao}

            </p>

            <div className="mt-6 flex items-center justify-between">

              <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">

                {template.usos} utilizações

              </span>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-700 p-2 text-white hover:bg-slate-600">

                  <Eye size={17} />

                </button>

                <button className="rounded-xl bg-slate-700 p-2 text-white hover:bg-slate-600">

                  <Copy size={17} />

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}