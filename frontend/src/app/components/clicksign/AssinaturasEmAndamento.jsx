"use client";

import {
  Clock3,
  CheckCircle2,
  FileText,
} from "lucide-react";

const documentos = [
  {
    nome: "Contrato João.pdf",
    progresso: 80,
    assinantes: "2/3 assinantes",
    status: "Aguardando Carlos",
  },
  {
    nome: "Aditivo Comercial.pdf",
    progresso: 45,
    assinantes: "1/2 assinantes",
    status: "Aguardando Maria",
  },
  {
    nome: "Distrato Pedro.pdf",
    progresso: 100,
    assinantes: "3/3 assinantes",
    status: "Concluído",
  },
];

export default function AssinaturasEmAndamento() {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <Clock3
          size={24}
          className="text-amber-400"
        />

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">

            Assinaturas em andamento

          </h2>

          <p className="text-slate-400">

            Acompanhe o progresso das assinaturas.

          </p>

        </div>

      </div>

      <div className="space-y-5">

        {documentos.map((doc, index) => (

          <div
            key={index}
            className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-5"
          >

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <FileText
                  size={20}
                  className="text-emerald-400"
                />

                <span className="font-semibold text-[var(--text)]">

                  {doc.nome}

                </span>

              </div>

              {doc.progresso === 100 && (

                <CheckCircle2
                  className="text-emerald-400"
                  size={20}
                />

              )}

            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-700">

              <div
                className={`h-full rounded-full ${
                  doc.progresso === 100
                    ? "bg-emerald-500"
                    : "bg-amber-400"
                }`}
                style={{
                  width: `${doc.progresso}%`,
                }}
              />

            </div>

            <div className="mt-3 flex justify-between text-sm">

              <span className="text-slate-300">

                {doc.assinantes}

              </span>

              <span className="text-slate-400">

                {doc.status}

              </span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}