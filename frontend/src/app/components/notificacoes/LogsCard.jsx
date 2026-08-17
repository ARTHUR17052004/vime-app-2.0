"use client";

import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Eye,
  Trash2,
} from "lucide-react";

const logs = [
  {
    canal: "WhatsApp",
    destinatario: "João Silva",
    status: "Enviado",
    data: "10/08/2026 08:30",
  },
  {
    canal: "E-mail",
    destinatario: "Maria Oliveira",
    status: "Pendente",
    data: "10/08/2026 09:12",
  },
  {
    canal: "Sistema",
    destinatario: "Administrador",
    status: "Erro",
    data: "10/08/2026 09:40",
  },
  {
    canal: "WhatsApp",
    destinatario: "Carlos Souza",
    status: "Enviado",
    data: "10/08/2026 10:02",
  },
];

function StatusIcon({ status }) {
  if (status === "Enviado")
    return <CheckCircle2 size={18} className="text-emerald-400" />;

  if (status === "Pendente")
    return <Clock3 size={18} className="text-yellow-400" />;

  return <AlertCircle size={18} className="text-red-400" />;
}

export default function LogsCard() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

            <History
              size={24}
              className="text-emerald-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[var(--text)]">
              Histórico de Envios
            </h2>

            <p className="text-slate-400">
              Últimas notificações enviadas pelo sistema.
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-[var(--text)] transition hover:bg-red-700">

          <Trash2 size={18} />

          Limpar Histórico

        </button>

      </div>

      <div className="space-y-4">

        {logs.map((log, index) => (

          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4"
          >

            <div className="flex items-center gap-4">

              <StatusIcon status={log.status} />

              <div>

                <h3 className="font-semibold text-[var(--text)]">

                  {log.destinatario}

                </h3>

                <p className="text-sm text-slate-400">

                  {log.canal}

                  {" • "}

                  {log.data}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  log.status === "Enviado"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : log.status === "Pendente"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {log.status}
              </span>

              <button className="rounded-xl bg-slate-700 p-2 text-[var(--text)] transition hover:bg-slate-600">

                <Eye size={18} />

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}