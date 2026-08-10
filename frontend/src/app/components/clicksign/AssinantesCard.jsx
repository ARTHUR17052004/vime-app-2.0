"use client";

import {
  Users,
  UserPlus,
  Mail,
  FileSignature,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";

const assinantes = [
  {
    nome: "Arthur Henrique",
    cargo: "Administrador",
    email: "arthur@vime.com.br",
    documentos: 248,
    status: "Ativo",
  },
  {
    nome: "Maria Oliveira",
    cargo: "Financeiro",
    email: "financeiro@vime.com.br",
    documentos: 91,
    status: "Ativo",
  },
  {
    nome: "Carlos Souza",
    cargo: "Jurídico",
    email: "juridico@vime.com.br",
    documentos: 36,
    status: "Inativo",
  },
];

export default function AssinantesCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

            <Users
              size={25}
              className="text-emerald-400"
            />

            Assinantes

          </h2>

          <p className="text-slate-400">

            Pessoas autorizadas a assinar documentos.

          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700 transition">

          <UserPlus size={18} />

          Novo Assinante

        </button>

      </div>

      <div className="space-y-4">

        {assinantes.map((usuario, index) => (

          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-slate-800/40 p-5 transition hover:border-emerald-500/30"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-bold text-emerald-400">

                  {usuario.nome.charAt(0)}

                </div>

                <div>

                  <h3 className="text-lg font-semibold text-white">

                    {usuario.nome}

                  </h3>

                  <p className="text-sm text-slate-400">

                    {usuario.cargo}

                  </p>

                </div>

              </div>

              <button className="rounded-xl bg-slate-700 p-2 hover:bg-slate-600">

                <MoreVertical
                  size={18}
                  className="text-white"
                />

              </button>

            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">

              <div className="flex items-center gap-2 text-slate-300">

                <Mail
                  size={17}
                  className="text-emerald-400"
                />

                {usuario.email}

              </div>

              <div className="flex items-center gap-2 text-slate-300">

                <FileSignature
                  size={17}
                  className="text-blue-400"
                />

                {usuario.documentos} documentos

              </div>

              <div className="flex items-center gap-2">

                <CheckCircle2
                  size={17}
                  className={
                    usuario.status === "Ativo"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                />

                <span
                  className={
                    usuario.status === "Ativo"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {usuario.status}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}