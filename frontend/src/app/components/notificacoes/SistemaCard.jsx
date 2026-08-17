"use client";

import {
  Bell,
  FileText,
  Receipt,
  ClipboardCheck,
  Users,
  Wrench,
} from "lucide-react";

const eventos = [
  {
    titulo: "Novo Contrato",
    descricao: "Notificar quando um contrato for criado.",
    icone: FileText,
    ativo: true,
  },
  {
    titulo: "Pagamento Recebido",
    descricao: "Avisar sobre recebimentos.",
    icone: Receipt,
    ativo: true,
  },
  {
    titulo: "Nova Solicitação",
    descricao: "Alertar novas solicitações.",
    icone: Bell,
    ativo: true,
  },
  {
    titulo: "Nova Vistoria",
    descricao: "Notificar criação de vistorias.",
    icone: ClipboardCheck,
    ativo: false,
  },
  {
    titulo: "Novo Inquilino",
    descricao: "Avisar quando houver novo cadastro.",
    icone: Users,
    ativo: true,
  },
  {
    titulo: "Manutenção",
    descricao: "Notificações de manutenção.",
    icone: Wrench,
    ativo: false,
  },
];

export default function SistemaCard() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-[var(--text)]">
          Notificações do Sistema
        </h2>

        <p className="text-slate-400">
          Escolha quais eventos internos do VIME irão gerar notificações.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {eventos.map((evento, index) => {

          const Icon = evento.icone;

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
                    {evento.titulo}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {evento.descricao}
                  </p>

                </div>

              </div>

              <button
                className={`h-7 w-14 rounded-full transition ${
                  evento.ativo
                    ? "bg-emerald-500"
                    : "bg-slate-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    evento.ativo
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