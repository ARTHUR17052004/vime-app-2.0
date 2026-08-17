"use client";

import {
  FileText,
  Pencil,
  Copy,
  Eye,
  CheckCircle2,
} from "lucide-react";

const templates = [
  {
    nome: "Boas-vindas",
    canal: "WhatsApp",
    status: "Ativo",
  },
  {
    nome: "Cobrança",
    canal: "WhatsApp + E-mail",
    status: "Ativo",
  },
  {
    nome: "Contrato",
    canal: "E-mail",
    status: "Ativo",
  },
  {
    nome: "Vistoria",
    canal: "Sistema",
    status: "Ativo",
  },
  {
    nome: "Solicitação",
    canal: "Sistema",
    status: "Ativo",
  },
  {
    nome: "Aviso Geral",
    canal: "Todos",
    status: "Ativo",
  },
];

export default function TemplatesCard() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

            <FileText
              size={24}
              className="text-emerald-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[var(--text)]">
              Templates
            </h2>

            <p className="text-slate-400">
              Modelos de mensagens utilizados pelo sistema.
            </p>

          </div>

        </div>

        <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-[var(--text)] hover:bg-emerald-700 transition">

          Novo Template

        </button>

      </div>

      <div className="space-y-4">

        {templates.map((item, index) => (

          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4"
          >

            <div>

              <h3 className="font-semibold text-[var(--text)]">
                {item.nome}
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Canal: {item.canal}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">

                <CheckCircle2 size={14} />

                {item.status}

              </span>

              <button className="rounded-xl bg-slate-700 p-2 text-[var(--text)] hover:bg-slate-600 transition">

                <Eye size={18} />

              </button>

              <button className="rounded-xl bg-slate-700 p-2 text-[var(--text)] hover:bg-slate-600 transition">

                <Pencil size={18} />

              </button>

              <button className="rounded-xl bg-slate-700 p-2 text-[var(--text)] hover:bg-slate-600 transition">

                <Copy size={18} />

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}